package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootHealthController {

    @GetMapping({"/", "/api", "/api/v1", "/api/v1/health"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("service", "Labour Connect Backend Platform");
        status.put("version", "1.0.0");
        status.put("serverTime", Instant.now().toString());
        status.put("swaggerDocumentation", "/swagger-ui.html");
        status.put("apiBasePath", "/api/v1");

        return ResponseEntity.ok(ApiResponse.ok("Labour Connect API v1 is active and healthy.", status));
    }
}
