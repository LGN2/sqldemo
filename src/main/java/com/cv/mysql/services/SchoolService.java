package com.cv.mysql.services;

import com.cv.mysql.entities.School;
import com.cv.mysql.repositories.SchoolRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    public Long createSchool(String name, String location) {
        School school = new School();
        school.setIsActive(true);
        school.setCreatedDate(new Date());
        school.setName(requireText(name, "School name"));
        school.setLocation(requireText(location, "Location"));

        return schoolRepository.save(school).getId();
    }

    public List<School> getAllSchools() {
        return schoolRepository.getAllSchool();
    }

    public School getById(Long id) {
        School school = schoolRepository.findById(id)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() -> new NoSuchElementException("School not found with id: " + id));

        return school;
    }

    public School updateSchool(Long id, String name, String location) {
        School schoolToUpdate = findActiveSchool(id);
        schoolToUpdate.setUpdatedDate(new Date());
        schoolToUpdate.setName(requireText(name, "School name"));
        schoolToUpdate.setLocation(requireText(location, "Location"));

        return schoolRepository.save(schoolToUpdate);
    }

    public Boolean deleteById(Long id) {
        School schoolToUpdate = schoolRepository.getById(id);
        if (schoolToUpdate == null) {
            return false;
        }

        schoolToUpdate.setIsActive(false);
        schoolToUpdate.setUpdatedDate(new Date());
        schoolRepository.save(schoolToUpdate);
        return true;
    }

    private School findActiveSchool(Long id) {
        School school = schoolRepository.getById(id);
        if (school == null) {
            throw new NoSuchElementException("School not found with id: " + id);
        }
        return school;
    }

    private String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
