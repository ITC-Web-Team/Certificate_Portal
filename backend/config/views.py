import io
import json

import pandas as pd
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse

from .models import Certificate, CertificateField
from .serializers import CertificateSerializer
from .rendering import render_certificate, to_png_bytes, to_pdf_bytes


def _read_csv(certificate):
    with certificate.csv_data.open('rb') as f:
        return pd.read_csv(io.BytesIO(f.read()))


def _find_row(certificate, roll_no):
    df = _read_csv(certificate)
    col = certificate.roll_column
    match = df[df[col].astype(str).str.strip() == str(roll_no).strip()]
    if match.empty:
        return None
    return match.iloc[0].to_dict()


def _build_render_fields(certificate, row_data):
    return [
        {
            "text": str(row_data.get(f.csv_column, "")),
            "x": f.x,
            "y": f.y,
            "font_size": f.font_size,
            "font_color": f.font_color,
            "font_family": f.font_family,
        }
        for f in CertificateField.objects.filter(certificate=certificate)
    ]


def _render_for_roll(certificate, roll_no):
    row = _find_row(certificate, roll_no)
    if row is None:
        return None, Response({"error": "Roll number not found"}, status=status.HTTP_404_NOT_FOUND)
    fields = _build_render_fields(certificate, row)
    with certificate.template.open('rb') as tf:
        img = render_certificate(tf, fields)
    return img, None


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_certificate(request):
    try:
        csv_file = request.FILES.get('csv_file')
        template = request.FILES.get('template')
        title = request.POST.get('title')
        organization = request.POST.get('organization')
        roll_column = request.POST.get('roll_column')
        user = request.POST.get('user')
        variables_json = request.POST.get('variables')

        if not all([csv_file, template, title, organization, roll_column, user, variables_json]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        certificate = Certificate.objects.create(
            title=title,
            organization=organization,
            user=user,
            template=template,
            csv_data=csv_file,
            roll_column=roll_column,
        )

        for v in json.loads(variables_json):
            CertificateField.objects.create(
                certificate=certificate,
                field_name=v['field_name'],
                csv_column=v['csv_column'],
                x=v['x'],
                y=v['y'],
                font_size=v['font_size'],
                font_color=v['font_color'],
                font_family=v.get('font_family', 'normal'),
            )

        return Response({'id': certificate.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_certificate(request, pk, user):
    try:
        Certificate.objects.get(id=pk, user=user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def user_certificate_list(request, user):
    serializer = CertificateSerializer(Certificate.objects.filter(user=user), many=True)
    return Response(serializer.data)


@api_view(['GET'])
def certificate_list(request):
    serializer = CertificateSerializer(Certificate.objects.filter(verified=True), many=True)
    return Response(serializer.data)


@api_view(['GET'])
def certificate_info(request, pk):
    try:
        cert = Certificate.objects.get(id=pk)
        return Response({'title': cert.title, 'organization': cert.organization})
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def certificate_details(request, pk, roll_no):
    try:
        cert = Certificate.objects.get(id=pk)
        row = _find_row(cert, roll_no)
        if row is None:
            return Response({"error": "Roll number not found"}, status=status.HTTP_404_NOT_FOUND)

        field_data = {}
        for f in CertificateField.objects.filter(certificate=cert):
            val = row.get(f.csv_column)
            if val is not None:
                field_data[f.field_name] = {
                    'value': str(val),
                    'x': f.x, 'y': f.y,
                    'font_size': f.font_size,
                    'font_color': f.font_color,
                    'font_family': f.font_family,
                }

        return Response({
            'template': cert.template.url,
            'title': cert.title,
            'organization': cert.organization,
            'fields': field_data,
        })
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def certificate_preview(request, pk):
    try:
        cert = Certificate.objects.get(id=pk)
        df = _read_csv(cert)
        first_roll = str(df.iloc[0][cert.roll_column])
        return Response({
            'title': cert.title,
            'organization': cert.organization,
            'first_roll': first_roll,
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def generate_certificate(request, pk, roll_no, mode=None):
    try:
        cert = Certificate.objects.get(id=pk)
        img, err = _render_for_roll(cert, roll_no)
        if err:
            return err

        filename = f"certificate_{pk}_{roll_no}"

        if mode == 'pdf':
            data = to_pdf_bytes(img)
            return HttpResponse(data, content_type='application/pdf',
                                headers={'Content-Disposition': f'attachment; filename="{filename}.pdf"'})

        png = to_png_bytes(img)
        disposition = 'attachment' if mode == 'png' else 'inline'
        return HttpResponse(png, content_type='image/png',
                            headers={'Content-Disposition': f'{disposition}; filename="{filename}.png"'})

    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def preview_render(request):
    template = request.FILES.get('template')
    variables_json = request.POST.get('variables')
    if not template or not variables_json:
        return Response({"error": "template and variables are required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        fields = json.loads(variables_json)
        img = render_certificate(template, fields)
        return HttpResponse(to_png_bytes(img), content_type='image/png')
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def user_templates(request, user):
    certs = Certificate.objects.filter(user=user)
    data = []
    for cert in certs:
        fields = CertificateField.objects.filter(certificate=cert)
        data.append({
            'id': cert.id,
            'title': cert.title,
            'template': cert.template.url,
            'verified': cert.verified,
            'organization': cert.organization,
            'created_at': cert.created_at,
            'csv_data': cert.csv_data.url,
            'fields': [
                {
                    'field_name': f.field_name,
                    'csv_column': f.csv_column,
                    'x': f.x, 'y': f.y,
                    'font_size': f.font_size,
                    'font_color': f.font_color,
                    'font_family': f.font_family,
                }
                for f in fields
            ],
        })
    return Response(data)


@api_view(['GET'])
def my_certificates(request, roll_no):
    results = []
    for cert in Certificate.objects.filter(verified=True):
        try:
            if _find_row(cert, roll_no) is not None:
                results.append({
                    'id': cert.id,
                    'title': cert.title,
                    'organization': cert.organization,
                    'template': cert.template.url,
                    'created_at': cert.created_at,
                })
        except Exception:
            continue
    return Response(results)


@api_view(['GET'])
def download_csv(request, pk, user):
    try:
        cert = Certificate.objects.get(id=pk, user=user)
        with cert.csv_data.open('rb') as f:
            resp = HttpResponse(f.read(), content_type='text/csv')
            resp['Content-Disposition'] = f'attachment; filename="{cert.title.lower().replace(" ", "-")}-data.csv"'
            return resp
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)
