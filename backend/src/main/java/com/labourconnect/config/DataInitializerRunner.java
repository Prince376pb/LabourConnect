package com.labourconnect.config;

import com.labourconnect.entity.*;
import com.labourconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class DataInitializerRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerRunner.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ReviewRepository reviewRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.init-email:admin@labourconnect.com}")
    private String adminInitEmail;

    @Value("${app.admin.init-password:Admin@1234}")
    private String adminInitPassword;

    @Value("${app.seed-data:true}")
    private boolean seedDataEnabled;

    public DataInitializerRunner(
        UserRepository userRepository,
        RoleRepository roleRepository,
        SkillRepository skillRepository,
        ServiceCategoryRepository serviceCategoryRepository,
        WorkerProfileRepository workerProfileRepository,
        EmployerProfileRepository employerProfileRepository,
        CustomerProfileRepository customerProfileRepository,
        ProviderProfileRepository providerProfileRepository,
        JobRepository jobRepository,
        JobApplicationRepository jobApplicationRepository,
        ServiceRequestRepository serviceRequestRepository,
        ReviewRepository reviewRepository,
        ComplaintRepository complaintRepository,
        AuditLogRepository auditLogRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.skillRepository = skillRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.reviewRepository = reviewRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting Labour Connect system initialization...");

        // 1. Ensure master roles exist
        Role adminRole = ensureRole("ROLE_ADMIN");
        Role employerRole = ensureRole("ROLE_EMPLOYER");
        Role workerRole = ensureRole("ROLE_WORKER");
        Role customerRole = ensureRole("ROLE_CUSTOMER");
        Role providerRole = ensureRole("ROLE_PROVIDER");

        // 2. Initialize Admin account if no admin exists
        Optional<User> existingAdmin = userRepository.findByEmail(adminInitEmail);
        User adminUser;
        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setEmail(adminInitEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminInitPassword));
            admin.setFullName("Platform Administrator");
            admin.setPhoneNumber("+91-9876543210");
            admin.setActive(true);
            admin.setSuspended(false);
            admin.getRoles().add(adminRole);
            adminUser = userRepository.save(admin);
            log.info("Initial administrator provisioned securely: {}", adminInitEmail);
        } else {
            adminUser = existingAdmin.get();
            if (!adminUser.getRoles().contains(adminRole)) {
                adminUser.getRoles().add(adminRole);
                adminUser = userRepository.save(adminUser);
            }
        }

        // 3. Optional Development Seed Data
        if (seedDataEnabled) {
            seedDevelopmentData(adminUser, employerRole, workerRole, customerRole, providerRole);
        }

        log.info("Labour Connect system initialization completed successfully.");
    }

    private Role ensureRole(String name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role(name);
            return roleRepository.save(role);
        });
    }

    private void seedDevelopmentData(User adminUser, Role employerRole, Role workerRole, Role customerRole, Role providerRole) {
        int usersInserted = 0, usersSkipped = 0;
        int jobsInserted = 0, jobsSkipped = 0;
        int appsInserted = 0, appsSkipped = 0;
        int requestsInserted = 0, requestsSkipped = 0;
        int reviewsInserted = 0, reviewsSkipped = 0;
        int complaintsInserted = 0, complaintsSkipped = 0;

        // ==========================================
        // 1. SEED EMPLOYERS (At least 2)
        // ==========================================
        List<EmployerProfile> employers = new ArrayList<>();

        // Employer 1: Apex Construction
        String emp1Email = "employer@labourconnect.com";
        if (!userRepository.existsByEmail(emp1Email)) {
            User u = new User();
            u.setEmail(emp1Email);
            u.setPasswordHash(passwordEncoder.encode("Employer@1234"));
            u.setFullName("Apex Construction & Hardware");
            u.setPhoneNumber("+91-9123456780");
            u.getRoles().add(employerRole);
            User saved = userRepository.save(u);
            usersInserted++;

            EmployerProfile ep = new EmployerProfile();
            ep.setUser(saved);
            ep.setCompanyName("Apex Construction & Hardware Stores");
            ep.setBusinessType("CONTRACTOR");
            ep.setAddress("45 Ring Road, Indiranagar");
            ep.setCity("Bangalore");
            ep.setContactPerson("Ramesh Kumar");
            ep.setPhone("+91-9123456780");
            employers.add(employerProfileRepository.save(ep));
        } else {
            usersSkipped++;
            User u = userRepository.findByEmail(emp1Email).orElseThrow();
            employerProfileRepository.findByUserId(u.getId()).ifPresent(employers::add);
        }

        // Employer 2: UrbanEdge Interiors
        String emp2Email = "employer2@labourconnect.com";
        if (!userRepository.existsByEmail(emp2Email)) {
            User u = new User();
            u.setEmail(emp2Email);
            u.setPasswordHash(passwordEncoder.encode("Employer@1234"));
            u.setFullName("UrbanEdge Design & Renovations");
            u.setPhoneNumber("+91-9123456789");
            u.getRoles().add(employerRole);
            User saved = userRepository.save(u);
            usersInserted++;

            EmployerProfile ep = new EmployerProfile();
            ep.setUser(saved);
            ep.setCompanyName("UrbanEdge Interior Design & Renovations");
            ep.setBusinessType("ENTERPRISE");
            ep.setAddress("122 100-Ft Road, Indiranagar");
            ep.setCity("Bangalore");
            ep.setContactPerson("Kavita Rao");
            ep.setPhone("+91-9123456789");
            employers.add(employerProfileRepository.save(ep));
        } else {
            usersSkipped++;
            User u = userRepository.findByEmail(emp2Email).orElseThrow();
            employerProfileRepository.findByUserId(u.getId()).ifPresent(employers::add);
        }

        // ==========================================
        // 2. SEED WORKERS (At least 5)
        // ==========================================
        List<WorkerProfile> workers = new ArrayList<>();

        Object[][] workerData = new Object[][]{
            {"worker@labourconnect.com", "Suresh Sharma", "+91-9845123456", "Experienced Mason & Concrete Specialist", "Residential masonry, bricklaying, and cement plastering.", 8, new BigDecimal("950.00"), new BigDecimal("150.00"), "Bangalore", "Indiranagar", 12.9716, 77.5946, new String[]{"Masonry", "General Construction Labour"}},
            {"worker2@labourconnect.com", "Ramesh Naik", "+91-9845123457", "Master Woodwork & Furniture Carpenter", "Custom wardrobes, doors, windows, and modular cabinetry.", 6, new BigDecimal("1000.00"), new BigDecimal("160.00"), "Bangalore", "Koramangala", 12.9352, 77.6245, new String[]{"Carpentry"}},
            {"worker3@labourconnect.com", "Vikram Singh", "+91-9845123458", "Certified Electrical Wiring Specialist", "Single-phase and 3-phase industrial and house wiring.", 7, new BigDecimal("1100.00"), new BigDecimal("175.00"), "Bangalore", "Whitefield", 12.9698, 77.7500, new String[]{"Electrical Wiring"}},
            {"worker4@labourconnect.com", "Deepak Verma", "+91-9845123459", "Professional Wall Painter & Putty Artist", "Interior emulsion, exterior weather coats, and waterproof priming.", 5, new BigDecimal("850.00"), new BigDecimal("130.00"), "Bangalore", "HSR Layout", 12.9121, 77.6446, new String[]{"House Painting"}},
            {"worker5@labourconnect.com", "Manoj Kumar", "+91-9845123460", "Precision Granite & Vitrified Tile Layer", "High-precision floor leveling, granite borders, and bathroom tiling.", 9, new BigDecimal("1050.00"), new BigDecimal("170.00"), "Bangalore", "Jayanagar", 12.9308, 77.5838, new String[]{"Tile Laying"}}
        };

        for (Object[] wd : workerData) {
            String email = (String) wd[0];
            if (!userRepository.existsByEmail(email)) {
                User u = new User();
                u.setEmail(email);
                u.setPasswordHash(passwordEncoder.encode("Worker@1234"));
                u.setFullName((String) wd[1]);
                u.setPhoneNumber((String) wd[2]);
                u.getRoles().add(workerRole);
                User saved = userRepository.save(u);
                usersInserted++;

                WorkerProfile wp = new WorkerProfile();
                wp.setUser(saved);
                wp.setHeadline((String) wd[3]);
                wp.setBio((String) wd[4]);
                wp.setYearsOfExperience((Integer) wd[5]);
                wp.setDailyRate((BigDecimal) wd[6]);
                wp.setHourlyRate((BigDecimal) wd[7]);
                wp.setCity((String) wd[8]);
                wp.setArea((String) wd[9]);
                wp.setLatitude((Double) wd[10]);
                wp.setLongitude((Double) wd[11]);
                wp.setAvailabilityStatus("AVAILABLE");

                for (String skillName : (String[]) wd[12]) {
                    skillRepository.findByName(skillName).ifPresent(s -> wp.getSkills().add(s));
                }
                workers.add(workerProfileRepository.save(wp));
            } else {
                usersSkipped++;
                User u = userRepository.findByEmail(email).orElseThrow();
                workerProfileRepository.findByUserId(u.getId()).ifPresent(workers::add);
            }
        }

        // ==========================================
        // 3. SEED CUSTOMERS (At least 3)
        // ==========================================
        List<CustomerProfile> customers = new ArrayList<>();

        Object[][] custData = new Object[][]{
            {"customer@labourconnect.com", "Priya Venkatesh", "+91-9988776655", "Flat 302, Green Glen Layout, Bellandur", "Bangalore", "Bellandur", 12.9304, 77.6784},
            {"customer2@labourconnect.com", "Anand Murthy", "+91-9988776656", "14th Main, Sector 4, HSR Layout", "Bangalore", "HSR Layout", 12.9121, 77.6446},
            {"customer3@labourconnect.com", "Sneha Patel", "+91-9988776657", "Palm Meadows Villa 42, Whitefield", "Bangalore", "Whitefield", 12.9698, 77.7500}
        };

        for (Object[] cd : custData) {
            String email = (String) cd[0];
            if (!userRepository.existsByEmail(email)) {
                User u = new User();
                u.setEmail(email);
                u.setPasswordHash(passwordEncoder.encode("Customer@1234"));
                u.setFullName((String) cd[1]);
                u.setPhoneNumber((String) cd[2]);
                u.getRoles().add(customerRole);
                User saved = userRepository.save(u);
                usersInserted++;

                CustomerProfile cp = new CustomerProfile();
                cp.setUser(saved);
                cp.setAddress((String) cd[3]);
                cp.setCity((String) cd[4]);
                cp.setArea((String) cd[5]);
                cp.setLatitude((Double) cd[6]);
                cp.setLongitude((Double) cd[7]);
                customers.add(customerProfileRepository.save(cp));
            } else {
                usersSkipped++;
                User u = userRepository.findByEmail(email).orElseThrow();
                customerProfileRepository.findByUserId(u.getId()).ifPresent(customers::add);
            }
        }

        // ==========================================
        // 4. SEED SERVICE PROVIDERS (At least 4)
        // ==========================================
        List<ProviderProfile> providers = new ArrayList<>();

        Object[][] provData = new Object[][]{
            {"provider@labourconnect.com", "Sunil Master Plumbers", "+91-9871122334", "Licensed plumbing contractor. Emergency water leak repair, bathroom renovations, and pipe fittings.", 6, new BigDecimal("350.00"), new BigDecimal("200.00"), "Bangalore", 20.0, 12.9784, 77.6408, "plumbing"},
            {"provider2@labourconnect.com", "SparkVolt Electrical Solutions", "+91-9871122335", "Master electricians for short circuit repair, DB box upgrades, switchboard setup, and inverter wiring.", 8, new BigDecimal("400.00"), new BigDecimal("250.00"), "Bangalore", 25.0, 12.9352, 77.6245, "electrical"},
            {"provider3@labourconnect.com", "MasterCraft Furniture & Carpentry", "+91-9871122336", "Expert carpenters for door lock alignment, wooden wardrobe repair, kitchen drawer channels, and partitions.", 7, new BigDecimal("450.00"), new BigDecimal("220.00"), "Bangalore", 20.0, 12.9121, 77.6446, "carpentry"},
            {"provider4@labourconnect.com", "ColorPro Home Painting & Waterproofing", "+91-9871122337", "Reliable residential painters for interior wall touch-ups, waterproof primer, and wood polish.", 5, new BigDecimal("500.00"), new BigDecimal("180.00"), "Bangalore", 20.0, 12.9698, 77.7500, "painting"}
        };

        for (Object[] pd : provData) {
            String email = (String) pd[0];
            if (!userRepository.existsByEmail(email)) {
                User u = new User();
                u.setEmail(email);
                u.setPasswordHash(passwordEncoder.encode("Provider@1234"));
                u.setFullName((String) pd[1]);
                u.setPhoneNumber((String) pd[2]);
                u.getRoles().add(providerRole);
                User saved = userRepository.save(u);
                usersInserted++;

                ProviderProfile pp = new ProviderProfile();
                pp.setUser(saved);
                pp.setBusinessName((String) pd[1]);
                pp.setBio((String) pd[3]);
                pp.setYearsOfExperience((Integer) pd[4]);
                pp.setBaseRate((BigDecimal) pd[5]);
                pp.setHourlyRate((BigDecimal) pd[6]);
                pp.setCity((String) pd[7]);
                pp.setServiceAreaRadiusKm((Double) pd[8]);
                pp.setLatitude((Double) pd[9]);
                pp.setLongitude((Double) pd[10]);
                pp.setVerificationStatus("APPROVED");
                pp.setVerifiedAt(Instant.now().minus(30, ChronoUnit.DAYS));
                pp.setAvailable(true);

                serviceCategoryRepository.findBySlug((String) pd[11]).ifPresent(c -> pp.getCategories().add(c));
                providers.add(providerProfileRepository.save(pp));
            } else {
                usersSkipped++;
                User u = userRepository.findByEmail(email).orElseThrow();
                providerProfileRepository.findByUserId(u.getId()).ifPresent(providers::add);
            }
        }

        // ==========================================
        // 5. SEED JOBS (12 realistic jobs)
        // ==========================================
        if (!employers.isEmpty()) {
            EmployerProfile emp1 = employers.get(0);
            EmployerProfile emp2 = employers.size() > 1 ? employers.get(1) : employers.get(0);

            Object[][] jobsData = new Object[][]{
                {emp1, "Senior Bricklayer & Mason Required for Commercial Renovation", "Need 2 skilled masons for high-precision brickwork and exterior cement plastering for a 5-day project.", "DAILY_WAGE", new BigDecimal("1000.00"), 5, "Bangalore", "Indiranagar", 12.9716, 77.5946, "OPEN", "Masonry"},
                {emp1, "Emergency Commercial Electrical Cable Pulling & Conduit Fitting", "Heavy gauge cable pulling and metal conduit fixing for new commercial retail floor.", "DAILY_WAGE", new BigDecimal("1100.00"), 3, "Bangalore", "Indiranagar", 12.9716, 77.5946, "OPEN", "Electrical Wiring"},
                {emp2, "Master Carpenter Needed for Teak Wood Wardrobes & Modular Kitchen", "Precision joinery, hinge alignment, and laminate pasting for high-end residential apartment.", "DAILY_WAGE", new BigDecimal("1200.00"), 6, "Bangalore", "Koramangala", 12.9352, 77.6245, "OPEN", "Carpentry"},
                {emp2, "Full Villa Exterior Waterproofing & Primer Painting", "Exterior scaffolding work, crack filling, and weather-shield paint application for 3-story villa.", "CONTRACT", new BigDecimal("950.00"), 7, "Bangalore", "Whitefield", 12.9698, 77.7500, "OPEN", "House Painting"},
                {emp1, "Italian Marble & Vitrified Tile Layer Required", "Laser leveling and diamond cutter fixing for 2,400 sq.ft living hall tile replacement.", "DAILY_WAGE", new BigDecimal("1050.00"), 4, "Bangalore", "Jayanagar", 12.9308, 77.5838, "OPEN", "Tile Laying"},
                {emp1, "Heavy Warehouse Cargo Loading & Shifting Crew", "Loading heavy construction materials, cement bags, and steel rods onto transport trucks.", "DAILY_WAGE", new BigDecimal("800.00"), 2, "Bangalore", "Electronic City", 12.8452, 77.6602, "OPEN", "Loading & Unloading"},
                {emp2, "Structural Metal Fabrication & Grille Welder", "Arc welding of heavy steel security gates, terrace railings, and MS window grilles.", "DAILY_WAGE", new BigDecimal("1150.00"), 5, "Bangalore", "HSR Layout", 12.9121, 77.6446, "IN_PROGRESS", "Welding & Fabrication"},
                {emp1, "Residential Plumbing Line Installation for 3-Story Apartment", "CPVC pipeline laying, drainage manifold fixing, and overhead tank connection.", "DAILY_WAGE", new BigDecimal("950.00"), 6, "Bangalore", "Bellandur", 12.9304, 77.6784, "OPEN", "Plumbing"},
                {emp1, "Construction Site Excavation & Earth Moving Helper", "Manual foundation trench excavation, soil shifting, and backfilling for boundary wall.", "DAILY_WAGE", new BigDecimal("750.00"), 4, "Bangalore", "Indiranagar", 12.9716, 77.5946, "OPEN", "General Construction Labour"},
                {emp2, "RCC Column Steel Bar Bending Specialist", "Tying and bending 16mm and 20mm TMT steel reinforcement cages for residential pillars.", "DAILY_WAGE", new BigDecimal("1000.00"), 4, "Bangalore", "Whitefield", 12.9698, 77.7500, "OPEN", "Bar Bending / Steel Fixing"},
                {emp2, "Interior Acrylic Wall Painting & Wall Putty Finish", "Complete two coats of Birla putty, primer sanding, and Asian Paints Royale application.", "CONTRACT", new BigDecimal("900.00"), 5, "Bangalore", "Koramangala", 12.9352, 77.6245, "CLOSED", "House Painting"},
                {emp1, "Commercial HVAC & Duct Piping Assistant", "Assisting senior AC mechanics with refrigerant copper piping and insulation wrapping.", "DAILY_WAGE", new BigDecimal("1100.00"), 3, "Bangalore", "Electronic City", 12.8452, 77.6602, "OPEN", "Plumbing"},
                {emp1, "Retail Store Salesman & Shop Assistant Required", "Seeking an energetic retail salesman for garments and accessories shop. Responsibilities include customer greeting, item display, stock inventory, and assisting shoppers.", "REGULAR", new BigDecimal("700.00"), 365, "Bangalore", "Indiranagar", 12.9716, 77.5946, "OPEN", "Retail Sales & Customer Service", new BigDecimal("18000.00"), new BigDecimal("24000.00"), "10:00 AM - 8:30 PM (6 days/week)"},
                {emp2, "Showroom Cashier & Billing Executive", "Looking for a punctual and reliable cashier for an electronic retail showroom. Candidate should handle POS billing, cash counting, card swiping, and daily invoice reconciliation.", "REGULAR", new BigDecimal("800.00"), 365, "Bangalore", "Koramangala", 12.9352, 77.6245, "OPEN", "Cashier & Billing", new BigDecimal("20000.00"), new BigDecimal("26000.00"), "9:30 AM - 7:30 PM (Mon-Sat)"},
                {emp1, "Commercial Office Assistant & General Helper", "Hiring a full-time office assistant for commercial office maintenance. Duties include managing daily files, courier packages, tea/coffee service, and office errands.", "REGULAR", new BigDecimal("650.00"), 365, "Bangalore", "Electronic City", 12.8452, 77.6602, "OPEN", "Office Assistant", new BigDecimal("16000.00"), new BigDecimal("22000.00"), "9:00 AM - 6:00 PM (Mon-Sat)"},
                {emp2, "Hardware & Electrical Shop Assistant & Counter Sales", "Hardware shop looking for assistant to handle inventory stocking, customer counter queries, and material loading for electrical goods.", "REGULAR", new BigDecimal("750.00"), 365, "Bangalore", "Whitefield", 12.9698, 77.7500, "OPEN", "Shop Assistant & Inventory", new BigDecimal("18000.00"), new BigDecimal("25000.00"), "10:00 AM - 8:00 PM"}
            };

            for (Object[] jd : jobsData) {
                String title = (String) jd[1];
                if (!jobRepository.existsByTitle(title)) {
                    Job j = new Job();
                    j.setEmployer((EmployerProfile) jd[0]);
                    j.setTitle(title);
                    j.setDescription((String) jd[2]);
                    j.setJobType((String) jd[3]);
                    j.setDailyWage((BigDecimal) jd[4]);
                    j.setEstimatedDays((Integer) jd[5]);
                    j.setCity((String) jd[6]);
                    j.setArea((String) jd[7]);
                    j.setLatitude((Double) jd[8]);
                    j.setLongitude((Double) jd[9]);
                    j.setStatus((String) jd[10]);

                    if (jd.length > 12) {
                        j.setMinMonthlySalary((BigDecimal) jd[12]);
                        j.setMaxMonthlySalary((BigDecimal) jd[13]);
                        j.setWorkingHours((String) jd[14]);
                    }

                    skillRepository.findByName((String) jd[11]).ifPresent(s -> j.getRequiredSkills().add(s));
                    jobRepository.save(j);
                    jobsInserted++;
                } else {
                    jobsSkipped++;
                }
            }
        }

        // ==========================================
        // 6. SEED JOB APPLICATIONS (14 applications)
        // ==========================================
        if (workers.size() >= 5) {
            WorkerProfile w1 = workers.get(0);
            WorkerProfile w2 = workers.get(1);
            WorkerProfile w3 = workers.get(2);
            WorkerProfile w4 = workers.get(3);
            WorkerProfile w5 = workers.get(4);

            List<Job> allJobs = jobRepository.findAll();
            if (!allJobs.isEmpty()) {
                Job j1 = allJobs.stream().filter(j -> j.getTitle().contains("Bricklayer")).findFirst().orElse(allJobs.get(0));
                Job j2 = allJobs.stream().filter(j -> j.getTitle().contains("Electrical Cable")).findFirst().orElse(allJobs.get(0));
                Job j3 = allJobs.stream().filter(j -> j.getTitle().contains("Teak Wood")).findFirst().orElse(allJobs.get(0));
                Job j4 = allJobs.stream().filter(j -> j.getTitle().contains("Waterproofing")).findFirst().orElse(allJobs.get(0));
                Job j5 = allJobs.stream().filter(j -> j.getTitle().contains("Marble & Vitrified")).findFirst().orElse(allJobs.get(0));
                Job j6 = allJobs.stream().filter(j -> j.getTitle().contains("Cargo Loading")).findFirst().orElse(allJobs.get(0));
                Job j7 = allJobs.stream().filter(j -> j.getTitle().contains("Metal Fabrication")).findFirst().orElse(allJobs.get(0));
                Job j8 = allJobs.stream().filter(j -> j.getTitle().contains("Plumbing Line")).findFirst().orElse(allJobs.get(0));
                Job j9 = allJobs.stream().filter(j -> j.getTitle().contains("Excavation")).findFirst().orElse(allJobs.get(0));

                Object[][] appData = new Object[][]{
                    {j1, w1, "ACCEPTED", new BigDecimal("1000.00"), "Ready to start immediately. Have 8 years masonry experience with clean line work."},
                    {j9, w1, "SHORTLISTED", new BigDecimal("750.00"), "Can bring a team of 2 helpers if required for site excavation."},
                    {j6, w1, "APPLIED", new BigDecimal("800.00"), "Available for cargo handling shifts this weekend."},
                    {j3, w2, "ACCEPTED", new BigDecimal("1200.00"), "Expert in Blum fittings and Godrej lock mechanisms. Own power tools."},
                    {j1, w2, "REJECTED", new BigDecimal("950.00"), "Available for construction helper tasks if carpentry is not needed."},
                    {j7, w2, "UNDER_REVIEW", new BigDecimal("1100.00"), "Have experience in metal framing and door shutter fixing."},
                    {j2, w3, "ACCEPTED", new BigDecimal("1100.00"), "Licensed wireman. Done commercial electrical conduit installations for IT parks."},
                    {j8, w3, "APPLIED", new BigDecimal("950.00"), "Can do bathroom concealed pipe routing and pressure testing."},
                    {j7, w3, "REJECTED", new BigDecimal("1200.00"), "Can assist with welding electrical points setup."},
                    {j4, w4, "SHORTLISTED", new BigDecimal("950.00"), "Specialized in exterior Dr. Fixit waterproofing and roller finish."},
                    {j5, w5, "ACCEPTED", new BigDecimal("1050.00"), "Italian marble specialist. Have precision angle cutters and spacers."},
                    {j1, w5, "UNDER_REVIEW", new BigDecimal("1000.00"), "Can assist with bricklaying and wall plastering."},
                    {j8, w1, "APPLIED", new BigDecimal("950.00"), "Experienced with pipe trenching and sanitary drainage fitting."},
                    {j2, w5, "REJECTED", new BigDecimal("1100.00"), "Willing to assist electrical team with floor chiseling."}
                };

                for (Object[] ad : appData) {
                    Job job = (Job) ad[0];
                    WorkerProfile worker = (WorkerProfile) ad[1];
                    String status = (String) ad[2];
                    BigDecimal bid = (BigDecimal) ad[3];
                    String notes = (String) ad[4];

                    if (!jobApplicationRepository.existsByJobIdAndWorkerId(job.getId(), worker.getId())) {
                        JobApplication app = new JobApplication();
                        app.setJob(job);
                        app.setWorker(worker);
                        app.setStatus(status);
                        app.setBidAmount(bid);
                        app.setCoverNote(notes);
                        jobApplicationRepository.save(app);
                        appsInserted++;
                    } else {
                        appsSkipped++;
                    }
                }
            }
        }

        // ==========================================
        // 7. SEED SERVICE REQUESTS (8 requests)
        // ==========================================
        if (!customers.isEmpty() && !providers.isEmpty()) {
            CustomerProfile c1 = customers.get(0);
            CustomerProfile c2 = customers.size() > 1 ? customers.get(1) : c1;
            CustomerProfile c3 = customers.size() > 2 ? customers.get(2) : c1;

            ProviderProfile p1 = providers.get(0); // Plumbing
            ProviderProfile p2 = providers.size() > 1 ? providers.get(1) : p1; // Electrical
            ProviderProfile p3 = providers.size() > 2 ? providers.get(2) : p1; // Carpentry
            ProviderProfile p4 = providers.size() > 3 ? providers.get(3) : p1; // Painting

            ServiceCategory catPlumb = serviceCategoryRepository.findBySlug("plumbing").orElse(null);
            ServiceCategory catElec = serviceCategoryRepository.findBySlug("electrical").orElse(null);
            ServiceCategory catCarp = serviceCategoryRepository.findBySlug("carpentry").orElse(null);
            ServiceCategory catPaint = serviceCategoryRepository.findBySlug("painting").orElse(null);

            Object[][] reqData = new Object[][]{
                {c1, p1, catPlumb, "Bathroom tap leakage & angle valve replacement", "Water leaking continuously from master bathroom washbasin hot/cold mixer and angle stop valve.", "Flat 302, Green Glen Layout, Bellandur", "Bangalore", 12.9304, 77.6784, "COMPLETED", new BigDecimal("450.00"), new BigDecimal("450.00"), null, null},
                {c2, p2, catElec, "Living room main circuit breaker tripping repair", "MCB trips whenever AC and geyser are switched on simultaneously. Needs load rebalancing.", "14th Main, Sector 4, HSR Layout", "Bangalore", 12.9121, 77.6446, "COMPLETED", new BigDecimal("650.00"), new BigDecimal("650.00"), null, null},
                {c3, p3, catCarp, "Wooden front door lock alignment & latch replacement", "Main entrance door latch is jammed and rubbing against the wooden frame.", "Palm Meadows Villa 42, Whitefield", "Bangalore", 12.9698, 77.7500, "SERVICE_STARTED", new BigDecimal("450.00"), null, null, null},
                {c1, p1, catPlumb, "Kitchen sink drain pipe blockage clearing", "Heavy grease clog in kitchen sink drainage manifold causing water backflow.", "Flat 302, Green Glen Layout, Bellandur", "Bangalore", 12.9304, 77.6784, "ON_THE_WAY", new BigDecimal("350.00"), null, null, null},
                {c2, p4, catPaint, "Bedroom dampness inspection & wall putty touchup", "Water seepage mark on bedroom east wall requiring scraping, primer sealing, and putty touchup.", "14th Main, Sector 4, HSR Layout", "Bangalore", 12.9121, 77.6446, "ACCEPTED", new BigDecimal("1200.00"), null, null, null},
                {c3, p2, catElec, "Ceiling fan motor winding & speed regulator replacement", "Master bedroom Havells fan running very slowly with burnt smell. Regulator also sparky.", "Palm Meadows Villa 42, Whitefield", "Bangalore", 12.9698, 77.7500, "REQUESTED", new BigDecimal("400.00"), null, null, null},
                {c1, p1, catPlumb, "Overhead water tank float valve replacement", "Rooftop Sintex water tank overflow valve stuck open, causing water overflow.", "Flat 302, Green Glen Layout, Bellandur", "Bangalore", 12.9304, 77.6784, "REQUESTED", new BigDecimal("500.00"), null, null, null},
                {c2, p3, catCarp, "Balcony sliding mesh door adjustment", "Balcony mosquito mesh door jumped off aluminum bottom track.", "14th Main, Sector 4, HSR Layout", "Bangalore", 12.9121, 77.6446, "CANCELLED", new BigDecimal("500.00"), null, null, "Customer rescheduled due to travel"}
            };

            for (Object[] rd : reqData) {
                String title = (String) rd[3];
                if (!serviceRequestRepository.existsByTitle(title)) {
                    ServiceRequest sr = new ServiceRequest();
                    sr.setCustomer((CustomerProfile) rd[0]);
                    sr.setProvider((ProviderProfile) rd[1]);
                    sr.setCategory((ServiceCategory) rd[2]);
                    sr.setTitle(title);
                    sr.setDescription((String) rd[4]);
                    sr.setServiceAddress((String) rd[5]);
                    sr.setCity((String) rd[6]);
                    sr.setLatitude((Double) rd[7]);
                    sr.setLongitude((Double) rd[8]);
                    sr.setStatus((String) rd[9]);
                    sr.setEstimatedCost((BigDecimal) rd[10]);
                    sr.setFinalCost((BigDecimal) rd[11]);
                    sr.setRejectionReason((String) rd[12]);
                    sr.setCancellationReason((String) rd[13]);
                    sr.setScheduledAt(Instant.now().plus(1, ChronoUnit.DAYS));
                    serviceRequestRepository.save(sr);
                    requestsInserted++;
                } else {
                    requestsSkipped++;
                }
            }
        }

        // ==========================================
        // 8. SEED REVIEWS (3 realistic reviews)
        // ==========================================
        Optional<ServiceRequest> sr1 = serviceRequestRepository.findFirstByTitle("Bathroom tap leakage & angle valve replacement");
        if (sr1.isPresent() && !customers.isEmpty() && !providers.isEmpty()) {
            ServiceRequest req = sr1.get();
            User reviewer = req.getCustomer().getUser();
            User reviewee = req.getProvider().getUser();

            if (!reviewRepository.existsByReviewerIdAndServiceRequestId(reviewer.getId(), req.getId())) {
                Review rev = new Review();
                rev.setReviewer(reviewer);
                rev.setReviewee(reviewee);
                rev.setServiceRequest(req);
                rev.setRating(5);
                rev.setReviewText("Prompt arrival! Sunil detected the cracked angle valve immediately and replaced it in 30 minutes. Clean and tidy work.");
                reviewRepository.save(rev);
                reviewsInserted++;
            } else {
                reviewsSkipped++;
            }
        }

        Optional<ServiceRequest> sr2 = serviceRequestRepository.findFirstByTitle("Living room main circuit breaker tripping repair");
        if (sr2.isPresent() && customers.size() > 1 && providers.size() > 1) {
            ServiceRequest req = sr2.get();
            User reviewer = req.getCustomer().getUser();
            User reviewee = req.getProvider().getUser();

            if (!reviewRepository.existsByReviewerIdAndServiceRequestId(reviewer.getId(), req.getId())) {
                Review rev = new Review();
                rev.setReviewer(reviewer);
                rev.setReviewee(reviewee);
                rev.setServiceRequest(req);
                rev.setRating(5);
                rev.setReviewText("Very knowledgeable electrician. Identified an overloaded circuit and balanced the phase lines perfectly. High quality work.");
                reviewRepository.save(rev);
                reviewsInserted++;
            } else {
                reviewsSkipped++;
            }
        }

        Optional<Job> j1Opt = jobRepository.findFirstByTitle("Senior Bricklayer & Mason Required for Commercial Renovation");
        if (j1Opt.isPresent() && !employers.isEmpty() && !workers.isEmpty()) {
            Job j1 = j1Opt.get();
            User employerUser = employers.get(0).getUser();
            User workerUser = workers.get(0).getUser();

            if (!reviewRepository.existsByReviewerIdAndJobId(employerUser.getId(), j1.getId())) {
                Review rev = new Review();
                rev.setReviewer(employerUser);
                rev.setReviewee(workerUser);
                rev.setJob(j1);
                rev.setRating(5);
                rev.setReviewText("Suresh is an exceptional bricklayer. Punctual, honest, and delivered pristine plaster joint finish. Highly recommended.");
                reviewRepository.save(rev);
                reviewsInserted++;
            } else {
                reviewsSkipped++;
            }
        }

        // ==========================================
        // 9. SEED COMPLAINTS (2 sample disputes)
        // ==========================================
        if (customers.size() > 1 && providers.size() > 2) {
            String comp1Subject = "Slight delay in scheduled carpentering visit";
            if (!complaintRepository.existsBySubject(comp1Subject)) {
                Complaint comp1 = new Complaint();
                comp1.setComplainant(customers.get(1).getUser());
                comp1.setReportedUser(providers.get(2).getUser());
                comp1.setSubject(comp1Subject);
                comp1.setDescription("Provider arrived 45 minutes later than confirmed appointment slot without advance notice.");
                comp1.setStatus("RESOLVED");
                comp1.setAdminResolutionNotes("Provider apologized in writing and issued a 10% goodwill voucher for next booking. Dispute closed satisfactorily.");
                comp1.setResolvedByAdmin(adminUser);
                complaintRepository.save(comp1);
                complaintsInserted++;
            } else {
                complaintsSkipped++;
            }

            String comp2Subject = "Dispute over unquoted wall prep charges";
            if (!complaintRepository.existsBySubject(comp2Subject)) {
                Complaint comp2 = new Complaint();
                comp2.setComplainant(customers.get(2).getUser());
                comp2.setReportedUser(providers.get(3).getUser());
                comp2.setSubject(comp2Subject);
                comp2.setDescription("Painter requested additional Rs 400 for wall primer that was verbally agreed as included in base quote.");
                comp2.setStatus("INVESTIGATING");
                complaintRepository.save(comp2);
                complaintsInserted++;
            } else {
                complaintsSkipped++;
            }
        }

        // ==========================================
        // 10. SEED AUDIT LOGS (Administrative events)
        // ==========================================
        if (auditLogRepository.count() == 0) {
            AuditLog log1 = new AuditLog(adminUser, "VERIFY_PROVIDER", "ProviderProfile", providers.get(0).getId(), "Provider Sunil Master Plumbers approved after ID verification", "127.0.0.1");
            AuditLog log2 = new AuditLog(adminUser, "RESOLVE_COMPLAINT", "Complaint", 1L, "Complaint regarding appointment delay resolved amicably", "127.0.0.1");
            AuditLog log3 = new AuditLog(adminUser, "CATALOG_UPDATE", "ServiceCategory", 1L, "Verified category active status for plumbing services", "127.0.0.1");
            auditLogRepository.saveAll(List.of(log1, log2, log3));
        }

        log.info("DEVELOPMENT DATA SEEDING SUMMARY:");
        log.info("  Users:         {} inserted, {} skipped", usersInserted, usersSkipped);
        log.info("  Jobs:          {} inserted, {} skipped", jobsInserted, jobsSkipped);
        log.info("  Applications:  {} inserted, {} skipped", appsInserted, appsSkipped);
        log.info("  Requests:      {} inserted, {} skipped", requestsInserted, requestsSkipped);
        log.info("  Reviews:       {} inserted, {} skipped", reviewsInserted, reviewsSkipped);
        log.info("  Complaints:    {} inserted, {} skipped", complaintsInserted, complaintsSkipped);
    }
}
