package com.labourconnect.service;

import com.labourconnect.entity.Skill;
import com.labourconnect.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category);
    }
}
