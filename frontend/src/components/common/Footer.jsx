import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Shield, CheckCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 text-slate-600 text-sm border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Labour<span className="text-teal-600">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Empowering local skilled labour, shopkeepers, contractors, and household customers with trusted connections.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-700 font-semibold">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Admin-Verified Service Badges</span>
            </div>
          </div>

          {/* Employment Connect Links */}
          <div>
            <h4 className="text-slate-900 font-bold mb-3 text-xs tracking-wider uppercase">Employment Connect</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="text-slate-600 hover:text-teal-600 transition-colors">Browse Wage Jobs</Link></li>
              <li><Link to="/register?role=WORKER" className="text-slate-600 hover:text-teal-600 transition-colors">Join as Skilled Worker</Link></li>
              <li><Link to="/register?role=EMPLOYER" className="text-slate-600 hover:text-teal-600 transition-colors">Post Jobs as Employer</Link></li>
            </ul>
          </div>

          {/* On-Demand Service Connect Links */}
          <div>
            <h4 className="text-slate-900 font-bold mb-3 text-xs tracking-wider uppercase">On-Demand Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/services" className="text-slate-600 hover:text-teal-600 transition-colors">Find Local Technicians</Link></li>
              <li><Link to="/register?role=PROVIDER" className="text-slate-600 hover:text-teal-600 transition-colors">Register as Service Provider</Link></li>
              <li><Link to="/register?role=CUSTOMER" className="text-slate-600 hover:text-teal-600 transition-colors">Book Household Services</Link></li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-slate-900 font-bold mb-3 text-xs tracking-wider uppercase">Trust & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="text-slate-600 hover:text-teal-600 transition-colors">Privacy Notice & Security</Link></li>
              <li><Link to="/terms" className="text-slate-600 hover:text-teal-600 transition-colors">Terms of Service</Link></li>
              <li><span className="text-slate-500">Government ID Verified Badges</span></li>
              <li><span className="text-slate-500">Dispute Mediation Desk</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Labour Connect. A digital platform for skilled employment & on-demand local services.</p>
          <p className="mt-2 md:mt-0 font-medium text-slate-600">
            Enterprise Spring Boot & React Engine
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
