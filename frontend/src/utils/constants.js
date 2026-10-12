export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  EMPLOYER: 'ROLE_EMPLOYER',
  WORKER: 'ROLE_WORKER',
  CUSTOMER: 'ROLE_CUSTOMER',
  PROVIDER: 'ROLE_PROVIDER'
};

export const JOB_STATUSES = {
  OPEN: { label: 'Open', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' }
};

export const APPLICATION_STATUSES = {
  APPLIED: { label: 'Applied', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  ACCEPTED: { label: 'Hired / Accepted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const SERVICE_STATUSES = {
  REQUESTED: { label: 'Requested', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  ACCEPTED: { label: 'Accepted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  ON_THE_WAY: { label: 'On The Way', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  SERVICE_STARTED: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Declined', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const VERIFICATION_STATUSES = {
  PENDING: { label: 'Verification Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  APPROVED: { label: 'Verified Provider', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  REJECTED: { label: 'Verification Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200' }
};

export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const EMPLOYMENT_TYPES = {
  DAILY_WAGE: {
    value: 'DAILY_WAGE',
    label: 'Daily Wage',
    subLabel: 'Day-to-day wage labour',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    unit: '/day'
  },
  CONTRACT: {
    value: 'CONTRACT',
    label: 'Contract',
    subLabel: 'Project-based / Short-term contract',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    unit: '/day'
  },
  REGULAR: {
    value: 'REGULAR',
    label: 'Regular Employment',
    subLabel: 'Shop assistant, salesman, cashier, office assistant (Monthly salary)',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    unit: '/month'
  }
};

export const getJobTypeBadge = (jobType) => {
  const type = (jobType || '').toUpperCase();
  if (type === 'REGULAR' || type === 'REGULAR_EMPLOYMENT' || type === 'FULL_TIME') {
    return {
      label: 'Regular Employment',
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    };
  }
  if (type === 'CONTRACT') {
    return {
      label: 'Contract',
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    };
  }
  return {
    label: 'Daily Wage',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };
};

export const formatJobCompensation = (job) => {
  if (!job) return '';
  const type = (job.jobType || '').toUpperCase();
  const isRegular = type === 'REGULAR' || type === 'REGULAR_EMPLOYMENT' || type === 'FULL_TIME';

  if (isRegular) {
    if (job.minMonthlySalary && job.maxMonthlySalary) {
      if (Number(job.minMonthlySalary) === Number(job.maxMonthlySalary)) {
        return `${formatCurrency(job.minMonthlySalary)}/mo`;
      }
      return `${formatCurrency(job.minMonthlySalary)} - ${formatCurrency(job.maxMonthlySalary)}/mo`;
    }
    if (job.minMonthlySalary) {
      return `From ${formatCurrency(job.minMonthlySalary)}/mo`;
    }
    if (job.maxMonthlySalary) {
      return `Up to ${formatCurrency(job.maxMonthlySalary)}/mo`;
    }
    if (job.dailyWage) {
      // Approximate monthly if daily wage was provided
      return `${formatCurrency(Number(job.dailyWage) * 26)}/mo`;
    }
    return 'Competitive Monthly Salary';
  }

  if (type === 'CONTRACT') {
    return `${formatCurrency(job.dailyWage)}/day`;
  }

  return `${formatCurrency(job.dailyWage)}/day`;
};
