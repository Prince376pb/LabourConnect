package com.labourconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LabourConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabourConnectApplication.class, args);
    }
}
