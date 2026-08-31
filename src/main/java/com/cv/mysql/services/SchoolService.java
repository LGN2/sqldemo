package com.cv.mysql.services;

import com.cv.mysql.entities.School;
import com.cv.mysql.repositories.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class SchoolService {

    SchoolRepository schoolRepository;
    @Autowired
    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    public Long createSchool(String name, String location){
        School school = new School();
        school.setIsActive(true);
        school.setCreatedDate(new Date());
        school.setName(name);
        school.setLocation(location);

        school =  schoolRepository.save(school);
        return school.getId();
    }

    public List<School> getAllSchools(){
        return schoolRepository.getAllSchool();
    }

    public School getById(Long id){
        Optional<School> school = schoolRepository.findById(id);
        if (school.isPresent() && school.get().getIsActive()){
            return school.get();
        }
        return new School();
    }

    public School updateSchool(Long id, String name, String location){
        School schoolToUpdate = schoolRepository.getById(id);
        if (schoolToUpdate == null){
            return new School();
        }
        schoolToUpdate.setUpdatedDate(new Date());
        schoolToUpdate.setName(name);
        schoolToUpdate.setLocation(location);
        schoolToUpdate = schoolRepository.save(schoolToUpdate);
        return schoolToUpdate;
    }

    public Boolean deleteById(Long id){
        School schoolToUpdate = schoolRepository.getById(id);
        if (schoolToUpdate == null){
            return false;
        }

        schoolToUpdate.setIsActive(false);
        schoolToUpdate.setUpdatedDate(new Date());
        schoolRepository.save(schoolToUpdate);
        return true;
    }
}
