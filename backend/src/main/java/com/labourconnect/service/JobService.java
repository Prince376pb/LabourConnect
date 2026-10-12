package com.labourconnect.service;

import com.labourconnect.dto.*;
import com.labourconnect.entity.*;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ForbiddenException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final SkillRepository skillRepository;
    private final ReviewRepository reviewRepository;
    private final AuditService auditService;

    public JobService(
        JobRepository jobRepository,
        JobApplicationRepository jobApplicationRepository,
        EmployerProfileRepository employerProfileRepository,
        WorkerProfileRepository workerProfileRepository,
        SkillRepository skillRepository,
        ReviewRepository reviewRepository,
        AuditService auditService
    ) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.skillRepository = skillRepository;
        this.reviewRepository = reviewRepository;
        this.auditService = auditService;
    }

    @Transactional
    public JobDto createJob(Long employerUserId, JobCreateRequest request) {
        EmployerProfile employer = employerProfileRepository.findByUserId(employerUserId)
            .orElseThrow(() -> new BadRequestException("Employer profile required before posting jobs."));

        Job job = new Job();
        job.setEmployer(employer);
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());

        boolean isRegular = "REGULAR".equalsIgnoreCase(request.getJobType()) || "REGULAR_EMPLOYMENT".equalsIgnoreCase(request.getJobType());
        if (isRegular) {
            job.setJobType("REGULAR");
            job.setMinMonthlySalary(request.getMinMonthlySalary());
            job.setMaxMonthlySalary(request.getMaxMonthlySalary());
            job.setWorkingHours(request.getWorkingHours());
            if (request.getDailyWage() != null) {
                job.setDailyWage(request.getDailyWage());
            } else if (request.getMinMonthlySalary() != null) {
                job.setDailyWage(request.getMinMonthlySalary().divide(BigDecimal.valueOf(26), 2, java.math.RoundingMode.HALF_UP));
            } else if (request.getMaxMonthlySalary() != null) {
                job.setDailyWage(request.getMaxMonthlySalary().divide(BigDecimal.valueOf(26), 2, java.math.RoundingMode.HALF_UP));
            }
            job.setEstimatedDays(request.getEstimatedDays() != null ? request.getEstimatedDays() : 365);
        } else {
            job.setJobType(request.getJobType().trim().toUpperCase());
            job.setDailyWage(request.getDailyWage());
            job.setMinMonthlySalary(request.getMinMonthlySalary());
            job.setMaxMonthlySalary(request.getMaxMonthlySalary());
            job.setWorkingHours(request.getWorkingHours());
            job.setEstimatedDays(request.getEstimatedDays() != null ? request.getEstimatedDays() : 1);
        }

        job.setCity(request.getCity().trim());
        job.setArea(request.getArea());
        job.setLatitude(request.getLatitude());
        job.setLongitude(request.getLongitude());
        job.setStatus("OPEN");

        if (request.getRequiredSkillIds() != null && !request.getRequiredSkillIds().isEmpty()) {
            List<Skill> skills = skillRepository.findAllById(request.getRequiredSkillIds());
            job.setRequiredSkills(new HashSet<>(skills));
        }

        Job savedJob = jobRepository.save(job);
        auditService.logEvent(employer.getUser(), "CREATE_JOB", "Job", savedJob.getId(), "Job posted: " + savedJob.getTitle(), null);

        return mapToDto(savedJob);
    }

    @Transactional
    public JobDto updateJob(Long employerUserId, Long jobId, JobCreateRequest request) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        // Object-level authorization check
        if (!job.getEmployer().getUser().getId().equals(employerUserId)) {
            throw new ForbiddenException("Unauthorized: You do not have permission to modify this job post.");
        }

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());

        boolean isRegular = "REGULAR".equalsIgnoreCase(request.getJobType()) || "REGULAR_EMPLOYMENT".equalsIgnoreCase(request.getJobType());
        if (isRegular) {
            job.setJobType("REGULAR");
            job.setMinMonthlySalary(request.getMinMonthlySalary());
            job.setMaxMonthlySalary(request.getMaxMonthlySalary());
            job.setWorkingHours(request.getWorkingHours());
            if (request.getDailyWage() != null) {
                job.setDailyWage(request.getDailyWage());
            } else if (request.getMinMonthlySalary() != null) {
                job.setDailyWage(request.getMinMonthlySalary().divide(BigDecimal.valueOf(26), 2, java.math.RoundingMode.HALF_UP));
            } else if (request.getMaxMonthlySalary() != null) {
                job.setDailyWage(request.getMaxMonthlySalary().divide(BigDecimal.valueOf(26), 2, java.math.RoundingMode.HALF_UP));
            }
            if (request.getEstimatedDays() != null) {
                job.setEstimatedDays(request.getEstimatedDays());
            }
        } else {
            job.setJobType(request.getJobType().trim().toUpperCase());
            job.setDailyWage(request.getDailyWage());
            job.setMinMonthlySalary(request.getMinMonthlySalary());
            job.setMaxMonthlySalary(request.getMaxMonthlySalary());
            job.setWorkingHours(request.getWorkingHours());
            job.setEstimatedDays(request.getEstimatedDays());
        }

        job.setCity(request.getCity().trim());
        job.setArea(request.getArea());
        job.setLatitude(request.getLatitude());
        job.setLongitude(request.getLongitude());

        if (request.getRequiredSkillIds() != null) {
            List<Skill> skills = skillRepository.findAllById(request.getRequiredSkillIds());
            job.setRequiredSkills(new HashSet<>(skills));
        }

        return mapToDto(jobRepository.save(job));
    }

    @Transactional
    public JobDto closeJob(Long employerUserId, Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!job.getEmployer().getUser().getId().equals(employerUserId)) {
            throw new ForbiddenException("Unauthorized: You do not own this job post.");
        }

        job.setStatus("CLOSED");
        return mapToDto(jobRepository.save(job));
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        return mapToDto(job);
    }

    @Transactional(readOnly = true)
    public Page<JobDto> searchJobs(String status, String city, String jobType, Long skillId, BigDecimal minWage, BigDecimal maxWage, String query, Pageable pageable) {
        Specification<Job> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }
            if (jobType != null && !jobType.isBlank() && !"ALL".equalsIgnoreCase(jobType)) {
                String jt = jobType.trim().toUpperCase();
                if ("REGULAR".equals(jt) || "REGULAR_EMPLOYMENT".equals(jt)) {
                    predicates.add(root.get("jobType").in("REGULAR", "REGULAR_EMPLOYMENT"));
                } else {
                    predicates.add(cb.equal(root.get("jobType"), jt));
                }
            }
            if (skillId != null) {
                Join<Job, Skill> skills = root.join("requiredSkills", JoinType.LEFT);
                predicates.add(cb.equal(skills.get("id"), skillId));
                q.distinct(true);
            }
            if (minWage != null) {
                predicates.add(cb.or(
                    cb.greaterThanOrEqualTo(root.get("dailyWage"), minWage),
                    cb.greaterThanOrEqualTo(root.get("minMonthlySalary"), minWage)
                ));
            }
            if (maxWage != null) {
                predicates.add(cb.or(
                    cb.lessThanOrEqualTo(root.get("dailyWage"), maxWage),
                    cb.lessThanOrEqualTo(root.get("maxMonthlySalary"), maxWage)
                ));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return jobRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<JobDto> searchJobs(String status, String city, String jobType, Long skillId, String query, Pageable pageable) {
        return searchJobs(status, city, jobType, skillId, null, null, query, pageable);
    }

    @Transactional(readOnly = true)
    public Page<JobDto> getEmployerJobs(Long employerUserId, String status, String city, String jobType, String query, Pageable pageable) {
        EmployerProfile employer = employerProfileRepository.findByUserId(employerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found."));

        Specification<Job> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("employer").get("id"), employer.getId()));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }
            if (jobType != null && !jobType.isBlank() && !"ALL".equalsIgnoreCase(jobType)) {
                String jt = jobType.trim().toUpperCase();
                if ("REGULAR".equals(jt) || "REGULAR_EMPLOYMENT".equals(jt)) {
                    predicates.add(root.get("jobType").in("REGULAR", "REGULAR_EMPLOYMENT"));
                } else {
                    predicates.add(cb.equal(root.get("jobType"), jt));
                }
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return jobRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<JobDto> getEmployerJobs(Long employerUserId, Pageable pageable) {
        return getEmployerJobs(employerUserId, null, null, null, null, pageable);
    }

    // --- APPLICATION WORKFLOWS ---
    @Transactional
    public JobApplicationDto applyForJob(Long workerUserId, Long jobId, JobApplicationCreateRequest request) {
        WorkerProfile worker = workerProfileRepository.findByUserId(workerUserId)
            .orElseThrow(() -> new BadRequestException("Worker profile must be created before applying for jobs."));

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!"OPEN".equalsIgnoreCase(job.getStatus())) {
            throw new BadRequestException("This job is no longer accepting applications (Status: " + job.getStatus() + ").");
        }

        // Prevent duplicate applications
        if (jobApplicationRepository.existsByJobIdAndWorkerId(jobId, worker.getId())) {
            throw new BadRequestException("You have already applied for this job.");
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setWorker(worker);
        application.setCoverNote(request.getCoverNote());
        application.setBidAmount(request.getBidAmount() != null ? request.getBidAmount() : job.getDailyWage());
        application.setStatus("APPLIED");

        JobApplication saved = jobApplicationRepository.save(application);
        auditService.logEvent(worker.getUser(), "APPLY_JOB", "JobApplication", saved.getId(), "Applied for job: " + job.getTitle(), null);

        return mapApplicationToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationDto> getJobApplications(Long employerUserId, Long jobId, String status, String query, Pageable pageable) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!job.getEmployer().getUser().getId().equals(employerUserId)) {
            throw new ForbiddenException("Unauthorized: You cannot view applications for another employer's job.");
        }

        Specification<JobApplication> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("job").get("id"), jobId));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Join<JobApplication, WorkerProfile> workerJoin = root.join("worker", JoinType.LEFT);
                Join<WorkerProfile, User> userJoin = workerJoin.join("user", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(cb.lower(userJoin.get("fullName")), pattern),
                    cb.like(cb.lower(workerJoin.get("headline")), pattern),
                    cb.like(cb.lower(root.get("coverNote")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return jobApplicationRepository.findAll(spec, pageable).map(this::mapApplicationToDto);
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationDto> getJobApplications(Long employerUserId, Long jobId, Pageable pageable) {
        return getJobApplications(employerUserId, jobId, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationDto> getWorkerApplications(Long workerUserId, String status, String query, Pageable pageable) {
        WorkerProfile worker = workerProfileRepository.findByUserId(workerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found."));

        Specification<JobApplication> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("worker").get("id"), worker.getId()));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Join<JobApplication, Job> jobJoin = root.join("job", JoinType.LEFT);
                Join<Job, EmployerProfile> empJoin = jobJoin.join("employer", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(cb.lower(jobJoin.get("title")), pattern),
                    cb.like(cb.lower(empJoin.get("companyName")), pattern),
                    cb.like(cb.lower(jobJoin.get("city")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return jobApplicationRepository.findAll(spec, pageable).map(this::mapApplicationToDto);
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationDto> getWorkerApplications(Long workerUserId, Pageable pageable) {
        return getWorkerApplications(workerUserId, null, null, pageable);
    }

    @Transactional
    public JobApplicationDto updateApplicationStatus(Long employerUserId, Long applicationId, String newStatus) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Object-level authorization
        if (!application.getJob().getEmployer().getUser().getId().equals(employerUserId)) {
            throw new ForbiddenException("Unauthorized: You do not own the job associated with this application.");
        }

        application.setStatus(newStatus.toUpperCase());

        // Synchronize job status if applicant is accepted
        if ("ACCEPTED".equalsIgnoreCase(newStatus)) {
            application.getJob().setStatus("IN_PROGRESS");
            jobRepository.save(application.getJob());
        }

        return mapApplicationToDto(jobApplicationRepository.save(application));
    }

    @Transactional
    public void withdrawApplication(Long workerUserId, Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!application.getWorker().getUser().getId().equals(workerUserId)) {
            throw new ForbiddenException("Unauthorized: You can only withdraw your own applications.");
        }

        application.setStatus("WITHDRAWN");
        jobApplicationRepository.save(application);
    }

    // --- MAPPERS ---
    public JobDto mapToDto(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setEmployerId(job.getEmployer().getId());
        dto.setEmployerCompanyName(job.getEmployer().getCompanyName());
        dto.setEmployerContactPerson(job.getEmployer().getContactPerson());
        dto.setEmployerCity(job.getEmployer().getCity());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setJobType(job.getJobType());
        dto.setDailyWage(job.getDailyWage());
        dto.setMinMonthlySalary(job.getMinMonthlySalary());
        dto.setMaxMonthlySalary(job.getMaxMonthlySalary());
        dto.setWorkingHours(job.getWorkingHours());
        dto.setEstimatedDays(job.getEstimatedDays());
        dto.setCity(job.getCity());
        dto.setArea(job.getArea());
        dto.setLatitude(job.getLatitude());
        dto.setLongitude(job.getLongitude());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());

        Set<Long> sIds = job.getRequiredSkills().stream().map(Skill::getId).collect(Collectors.toSet());
        Set<String> sNames = job.getRequiredSkills().stream().map(Skill::getName).collect(Collectors.toSet());
        dto.setRequiredSkillIds(sIds);
        dto.setRequiredSkillNames(sNames);
        dto.setApplicationCount(jobApplicationRepository.countByJobId(job.getId()));
        return dto;
    }

    public JobApplicationDto mapApplicationToDto(JobApplication app) {
        JobApplicationDto dto = new JobApplicationDto();
        dto.setId(app.getId());
        dto.setJobId(app.getJob().getId());
        dto.setJobTitle(app.getJob().getTitle());
        dto.setJobType(app.getJob().getJobType());
        dto.setJobCity(app.getJob().getCity());
        dto.setJobDailyWage(app.getJob().getDailyWage());
        dto.setJobMinMonthlySalary(app.getJob().getMinMonthlySalary());
        dto.setJobMaxMonthlySalary(app.getJob().getMaxMonthlySalary());
        dto.setJobWorkingHours(app.getJob().getWorkingHours());
        dto.setEmployerCompanyName(app.getJob().getEmployer().getCompanyName());

        dto.setWorkerId(app.getWorker().getId());
        dto.setWorkerUserId(app.getWorker().getUser().getId());
        dto.setWorkerFullName(app.getWorker().getUser().getFullName());
        dto.setWorkerPhone(app.getWorker().getUser().getPhoneNumber());
        dto.setWorkerHeadline(app.getWorker().getHeadline());
        dto.setWorkerYearsOfExperience(app.getWorker().getYearsOfExperience());

        Set<String> skills = app.getWorker().getSkills().stream().map(Skill::getName).collect(Collectors.toSet());
        dto.setWorkerSkills(skills);
        dto.setWorkerRating(reviewRepository.getAverageRatingForUser(app.getWorker().getUser().getId()));

        dto.setCoverNote(app.getCoverNote());
        dto.setBidAmount(app.getBidAmount());
        dto.setStatus(app.getStatus());
        dto.setCreatedAt(app.getCreatedAt());
        return dto;
    }
}
