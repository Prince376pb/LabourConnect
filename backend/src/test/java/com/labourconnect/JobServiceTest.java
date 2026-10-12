package com.labourconnect;

import com.labourconnect.dto.*;
import com.labourconnect.entity.Role;
import com.labourconnect.entity.User;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ForbiddenException;
import com.labourconnect.repository.RoleRepository;
import com.labourconnect.repository.UserRepository;
import com.labourconnect.service.AuthService;
import com.labourconnect.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class JobServiceTest {

    @Autowired
    private JobService jobService;

    @Autowired
    private AuthService authService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    private Long employerUserId;
    private Long otherEmployerUserId;
    private Long workerUserId;

    @BeforeEach
    void setUp() {
        if (!roleRepository.existsByName("ROLE_WORKER")) roleRepository.save(new Role("ROLE_WORKER"));
        if (!roleRepository.existsByName("ROLE_EMPLOYER")) roleRepository.save(new Role("ROLE_EMPLOYER"));

        AuthResponse empResp = authService.register(new RegisterRequest("emp1@test.com", "Pass@123", "Employer One", "+91-9988001122", "EMPLOYER"));
        employerUserId = empResp.getUser().getId();

        AuthResponse otherEmpResp = authService.register(new RegisterRequest("emp2@test.com", "Pass@123", "Employer Two", "+91-9988001123", "EMPLOYER"));
        otherEmployerUserId = otherEmpResp.getUser().getId();

        AuthResponse workerResp = authService.register(new RegisterRequest("wrk1@test.com", "Pass@123", "Worker One", "+91-9988001124", "WORKER"));
        workerUserId = workerResp.getUser().getId();
    }

    @Test
    @DisplayName("Employer can create job post successfully")
    void testCreateJob() {
        JobCreateRequest req = new JobCreateRequest();
        req.setTitle("Need Carpenter for Modular Kitchen");
        req.setDescription("Installation of 4 kitchen wall cabinets.");
        req.setJobType("DAILY_WAGE");
        req.setDailyWage(new BigDecimal("900.00"));
        req.setCity("Bangalore");

        JobDto job = jobService.createJob(employerUserId, req);

        assertNotNull(job);
        assertNotNull(job.getId());
        assertEquals("Need Carpenter for Modular Kitchen", job.getTitle());
        assertEquals("OPEN", job.getStatus());
    }

    @Test
    @DisplayName("Non-owner employer cannot edit another employer's job")
    void testObjectLevelAuthorization() {
        JobCreateRequest req = new JobCreateRequest();
        req.setTitle("Original Job");
        req.setDescription("Original Description");
        req.setJobType("DAILY_WAGE");
        req.setDailyWage(new BigDecimal("800.00"));
        req.setCity("Bangalore");

        JobDto job = jobService.createJob(employerUserId, req);

        JobCreateRequest updateReq = new JobCreateRequest();
        updateReq.setTitle("Tampered Title");
        updateReq.setDescription("Tampered Description");
        updateReq.setJobType("DAILY_WAGE");
        updateReq.setDailyWage(new BigDecimal("900.00"));
        updateReq.setCity("Bangalore");

        assertThrows(ForbiddenException.class, () -> jobService.updateJob(otherEmployerUserId, job.getId(), updateReq));
    }

    @Test
    @DisplayName("Duplicate job applications from same worker are prevented")
    void testDuplicateApplicationPrevention() {
        JobCreateRequest req = new JobCreateRequest();
        req.setTitle("Masonry Project");
        req.setDescription("Stone wall construction.");
        req.setJobType("CONTRACT");
        req.setDailyWage(new BigDecimal("1000.00"));
        req.setCity("Bangalore");

        JobDto job = jobService.createJob(employerUserId, req);

        JobApplicationCreateRequest appReq = new JobApplicationCreateRequest("I have 5 years experience.", new BigDecimal("1000.00"));
        JobApplicationDto firstApp = jobService.applyForJob(workerUserId, job.getId(), appReq);
        assertNotNull(firstApp);

        // Second application by same worker to same job must fail
        assertThrows(BadRequestException.class, () -> jobService.applyForJob(workerUserId, job.getId(), appReq));
    }

    @Test
    @DisplayName("Employer can create regular employment job with monthly salary range and working hours")
    void testRegularEmploymentJobCreationAndFiltering() {
        JobCreateRequest req = new JobCreateRequest();
        req.setTitle("Showroom Salesman & Cashier");
        req.setDescription("Full time regular shop assistant for retail counter.");
        req.setJobType("REGULAR");
        req.setMinMonthlySalary(new BigDecimal("18000.00"));
        req.setMaxMonthlySalary(new BigDecimal("24000.00"));
        req.setWorkingHours("10:00 AM - 8:00 PM");
        req.setCity("Bangalore");
        req.setArea("Indiranagar");

        JobDto createdJob = jobService.createJob(employerUserId, req);

        assertNotNull(createdJob);
        assertEquals("REGULAR", createdJob.getJobType());
        assertEquals(new BigDecimal("18000.00"), createdJob.getMinMonthlySalary());
        assertEquals(new BigDecimal("24000.00"), createdJob.getMaxMonthlySalary());
        assertEquals("10:00 AM - 8:00 PM", createdJob.getWorkingHours());
        assertNotNull(createdJob.getDailyWage(), "Daily wage equivalent should be calculated for backward compatibility");

        // Worker applies for regular job
        JobApplicationCreateRequest appReq = new JobApplicationCreateRequest("Experienced in retail counter sales.", new BigDecimal("20000.00"));
        JobApplicationDto app = jobService.applyForJob(workerUserId, createdJob.getId(), appReq);
        assertNotNull(app);
        assertEquals("REGULAR", app.getJobType());
        assertEquals(new BigDecimal("18000.00"), app.getJobMinMonthlySalary());
        assertEquals("10:00 AM - 8:00 PM", app.getJobWorkingHours());

        // Search regular jobs by jobType filter
        var regularJobs = jobService.searchJobs("OPEN", "Bangalore", "REGULAR", null, null, null, null, org.springframework.data.domain.PageRequest.of(0, 10));
        assertTrue(regularJobs.getContent().stream().anyMatch(j -> j.getId().equals(createdJob.getId())));
    }
}
