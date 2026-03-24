import { buttonVariants } from "@/lib/constants/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award, CheckCircle, Shield } from "lucide-react";
import { getSsoLoginUrl } from "@/lib/sso";

const features = [
  {
    icon: <Award className="w-6 h-6" />,
    title: "Digital Certificates",
    description: "Create and manage professional certificates with ease"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Verification",
    description: "Instantly verify the authenticity of certificates"
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Easy Distribution",
    description: "Seamlessly distribute certificates to participants"
  }
];

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = () => {
    setLoginError(null);
    try {
      window.location.href = getSsoLoginUrl();
    } catch {
      setLoginError("SSO is not configured. Set VITE_SSO_PROJECT_ID in .env.");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      localStorage.removeItem('user');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left side - Content */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl text-center font-bold tracking-tight text-gray-900 sm:text-6xl">
                Certificate Portal
              </h1>
              <p className="mt-6 text-lg text-center leading-8 text-gray-600">
                Your one-stop solution for creating, managing, and verifying digital certificates. 
                Streamline your certification process.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 w-full">
                {loginError ? (
                  <p className="text-sm text-red-600 text-center max-w-md">{loginError}</p>
                ) : null}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className={buttonVariants({
                    size: "lg", 
                    className: "group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  })}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></span>
                  <span className="relative z-10 flex items-center">
                    Login with SSO
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Features */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side - Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto w-full max-w-lg lg:mx-0"
          >
            <div className="relative aspect-[14/9] w-full rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/10 overflow-hidden group">
              <img
                src="/img/certificate.png"
                alt="Certificate Preview"
                className="absolute inset-0 z-20 w-full h-full object-cover"
              />
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/60 to-transparent h-32" />
              
              {/* Gradient moving shadow */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-move" />
              </div>
            </div>
            {/* Floating badges/elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 z-10 bg-blue-500 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 z-10 bg-green-500 rounded-full opacity-20 animate-pulse delay-300" />
          </motion.div>
        </div>
      </div>
    </div>
  );
} 