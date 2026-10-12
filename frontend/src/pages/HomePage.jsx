import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatJobCompensation, getJobTypeBadge } from '../utils/constants';
import {
  Briefcase,
  Wrench,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Hammer,
  Zap,
  Paintbrush,
  Car,
  FileText,
  Lock,
  Headphones,
  Check
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fallback categories if database query is empty or loading
  const fallbackCategories = [
    { id: 1, name: 'Plumbing', slug: 'plumbing', description: 'Leak repairs, pipe installations, and sanitary maintenance' },
    { id: 2, name: 'Electrical', slug: 'electrical', description: 'Wiring, circuit installations, fittings, and safety inspections' },
    { id: 3, name: 'Carpentry', slug: 'carpentry', description: 'Custom woodwork, repairs, doors, and furniture assembly' },
    { id: 4, name: 'Painting', slug: 'painting', description: 'Interior and exterior wall painting, touch-ups, and waterproofing' },
    { id: 5, name: 'Appliance Repair', slug: 'appliance-repair', description: 'AC, refrigerator, washing machine, and electrical repairs' },
    { id: 6, name: 'Construction & Masonry', slug: 'masonry', description: 'Plastering, tile setting, brickwork, and renovation labour' },
  ];

  useEffect(() => {
    // Load categories from backend API
    api.get('/categories')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data.slice(0, 6));
        } else {
          setCategories(fallbackCategories);
        }
      })
      .catch((err) => {
        console.error("Could not load categories", err);
        setCategories(fallbackCategories);
      });

    // Load recent open jobs from backend API
    setLoadingJobs(true);
    api.get('/jobs?size=3&status=OPEN')
      .then((res) => {
        if (res.data && res.data.content) {
          setFeaturedJobs(res.data.content);
        }
      })
      .catch((err) => console.error("Could not load jobs", err))
      .finally(() => setLoadingJobs(false));
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'plumbing': return <Wrench className="w-5 h-5 text-teal-600" />;
      case 'electrical': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'carpentry': return <Hammer className="w-5 h-5 text-orange-600" />;
      case 'painting': return <Paintbrush className="w-5 h-5 text-indigo-600" />;
      case 'appliance-repair':
      case 'mechanical': return <Car className="w-5 h-5 text-rose-600" />;
      default: return <Wrench className="w-5 h-5 text-teal-600" />;
    }
  };

  const displayedCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="space-y-20 pb-20 bg-white">
      {/* 1. HERO SECTION (Clean, Open, Balanced) */}
      <section className="bg-gradient-to-b from-slate-50 via-teal-50/20 to-white pt-14 pb-16 border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Trust Headline Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Skilled Employment & On-Demand Local Services</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            Connecting Skilled Labour, Contractors, and <span className="text-teal-600">Local Services</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            A digital marketplace for skilled daily-wage employment and household repairs.
            Verified credentials, transparent wage rates, and accountable service delivery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-xs">
                <Briefcase className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
            </Link>
            <Link to="/services" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-700 border-slate-300 hover:bg-slate-50">
                <Wrench className="w-4 h-4 mr-2 text-teal-600" />
                Find Local Services
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500 font-medium pt-6 border-t border-slate-200/60">
            <span className="flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-teal-600" />
              <span>Transparent Daily Wage Rates</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-teal-600" />
              <span>Admin-Verified Provider Badges</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-teal-600" />
              <span>Formal Dispute Resolution</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. TWO CORE MODULES (Open Layout, No Heavy Outer Boxes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Two Integrated Solutions, One Platform
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose the workflow designed for your needs—hiring daily-wage workforce or booking technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Module 1: Employment Connect */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Employment Module</span>
                <h3 className="text-xl font-bold text-slate-900">Employment Connect</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Designed for construction contractors, workshop owners, and skilled daily-wage workers.
              Post vacancies with clear wages, filter applicants by verified skills, and track application milestones.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Rule-based matching on trade skills, location, and daily wage rates</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Clear application lifecycle: Applied → Shortlisted → Accepted</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Mutual post-completion reviews between worker and employer</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/jobs">
                <Button size="sm">Browse Wage Jobs</Button>
              </Link>
              <Link to="/register?role=EMPLOYER">
                <Button variant="outline" size="sm">Post a Job as Employer</Button>
              </Link>
              <Link to="/register?role=WORKER" className="text-xs font-semibold text-teal-600 hover:text-teal-700 ml-2">
                Join as Skilled Worker →
              </Link>
            </div>
          </div>

          {/* Module 2: On-Demand Service Connect */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Local Services</span>
                <h3 className="text-xl font-bold text-slate-900">On-Demand Service Connect</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Direct connection for local household and commercial maintenance. Book nearby electricians,
              plumbers, carpenters, and appliance repair specialists with transparent base rates.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Administrative ID screening and Verified Badge badges</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Milestone updates: Requested → Accepted → In Progress → Completed</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Administrative dispute resolution desk for fair resolutions</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/services">
                <Button variant="secondary" size="sm">Find Local Technicians</Button>
              </Link>
              <Link to="/register?role=PROVIDER">
                <Button variant="outline" size="sm">Register as Provider</Button>
              </Link>
              <Link to="/register?role=CUSTOMER" className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-2">
                Book Services →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR SERVICE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Service Categories</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore on-demand technicians by specialized trade</p>
          </div>
          <Link to="/services" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {displayedCategories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              to={`/services?category=${cat.id}`}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-xs transition-all text-center flex flex-col items-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center mb-2.5 transition-colors">
                {getCategoryIcon(cat.slug)}
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-colors line-clamp-1">
                {cat.name}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS (Clean, Open Horizontal Steps, No Card Enclosures) */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How Labour Connect Works
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              A transparent, accountable workflow for hiring and service bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Search & Discover',
                desc: 'Browse open wage job postings by skill and location, or locate verified local trade technicians.'
              },
              {
                step: '02',
                title: 'Match & Connect',
                desc: 'Apply directly with your trade profile or book an on-demand service request with upfront scope.'
              },
              {
                step: '03',
                title: 'Execute & Track',
                desc: 'Follow real-time milestone transitions from dispatch to job start with direct contact.'
              },
              {
                step: '04',
                title: 'Settle & Review',
                desc: 'Inspect completed work, settle payments directly, and submit verified ratings.'
              },
            ].map((st, i) => (
              <div key={i} className="space-y-2">
                <div className="text-xs font-black text-teal-600 font-mono tracking-wider">
                  STEP {st.step}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED JOB OPPORTUNITIES (Retained & Polished as Requested) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Job Opportunities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recent skilled and daily-wage postings from registered employers</p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">
                        {job.employerCompanyName || 'Registered Contractor'}
                      </span>
                      {(() => {
                        const tb = getJobTypeBadge(job.jobType);
                        return (
                          <span className={`inline-block self-start mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${tb.bg} ${tb.text} ${tb.border}`}>
                            {tb.label}
                          </span>
                        );
                      })()}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                      {formatJobCompensation(job)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{job.city || 'Bangalore'}</span>
                  </div>
                  <span className="text-teal-600 font-semibold flex items-center shrink-0">
                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200">
            <Briefcase className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Browse active skilled wage postings on our jobs board.</p>
            <Link to="/jobs" className="mt-3 inline-block">
              <Button size="sm">Explore Jobs Board</Button>
            </Link>
          </div>
        )}
      </section>

      {/* 6. TRUST, VERIFICATION & ACCOUNTABILITY (Clean Open Layout, No Box-in-Box) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="border-t border-slate-200 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Content (Trust & Governance) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Trust & Governance</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Built with Transparency, Verification, and Accountability
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Labour Connect provides verified local matching with accountable governance.
                Service providers undergo administrative document inspection, job postings feature
                unambiguous wage rates, and formal complaints are mediated through our platform audit desk.
              </p>

              {/* Verified Trust Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Admin ID Screening</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Provider trade credentials and identification are inspected before granting Verified Badges.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <span>BCrypt Hashing & JWT Security</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    User credentials are encrypted with BCrypt hashing and protected by authenticated sessions.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <Headphones className="w-4 h-4 text-teal-600" />
                    <span>Dispute Mediation Desk</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Formal complaint logging for mediation of quality or wage discrepancies.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Transparent Platform Rules</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Clear privacy disclosures and mutual Terms of Service governing every interaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel (Simple Open Registration CTA) */}
            <div className="lg:col-span-5 bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Ready to join Labour Connect?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create a free account as an employer, skilled worker, household customer, or service technician.
              </p>

              <div className="space-y-2.5 pt-1">
                <Link to="/register" className="block">
                  <Button size="md" className="w-full">
                    Create Free Account
                  </Button>
                </Link>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <Link to="/privacy" className="text-slate-600 hover:text-teal-600 font-medium">
                    Read Privacy Notice
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/terms" className="text-slate-600 hover:text-teal-600 font-medium">
                    Read Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
