package com.cv.mysql.controllers;

import com.cv.mysql.entities.School;
import com.cv.mysql.services.SchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("school")
public class SchoolController {

    SchoolService schoolService;
    @Autowired
    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @PostMapping("add")
    public Long addSchool(@RequestParam String schoolName,@RequestParam String location){
        return schoolService.createSchool(schoolName, location);
    }
    @GetMapping("getAll")
    public List<School> getAllSchools(){
        return schoolService.getAllSchools();
    }

    @GetMapping("getById")
    public School getById(@RequestParam Long id){
        return schoolService.getById(id);
    }

    @PutMapping("update")
    public School updateSchool(@RequestParam Long id,
                               @RequestParam String name,
                               @RequestParam String location){
        return schoolService.updateSchool(id, name, location);
    }
    @DeleteMapping("deleteById")
    public Boolean deleteSchool(@RequestParam Long id){
        return schoolService.deleteById(id);
    }
}
