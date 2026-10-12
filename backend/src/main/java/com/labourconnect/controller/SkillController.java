package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.entity.Skill;
import com.labourconnect.service.SkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Skill>>> getSkills(@RequestParam(required = false) String category) {
        List<Skill> skills = (category != null && !category.isBlank())
            ? skillService.getSkillsByCategory(category)
            : skillService.getAllSkills();
        return ResponseEntity.ok(ApiResponse.ok(skills));
    }
}
