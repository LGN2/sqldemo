package com.cv.mysql.services;

import com.cv.mysql.entities.School;
import com.cv.mysql.repositories.SchoolRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SchoolServiceTest {

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private SchoolService schoolService;

    @Test
    void createSchoolTrimsInputAndReturnsGeneratedId() {
        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School school = invocation.getArgument(0);
            school.setId(10L);
            return school;
        });

        Long id = schoolService.createSchool("  Horizon School  ", "  Muscat  ");

        ArgumentCaptor<School> captor = ArgumentCaptor.forClass(School.class);
        verify(schoolRepository).save(captor.capture());
        School savedSchool = captor.getValue();

        assertThat(id).isEqualTo(10L);
        assertThat(savedSchool.getName()).isEqualTo("Horizon School");
        assertThat(savedSchool.getLocation()).isEqualTo("Muscat");
        assertThat(savedSchool.getIsActive()).isTrue();
        assertThat(savedSchool.getCreatedDate()).isNotNull();
    }

    @Test
    void createSchoolRejectsBlankName() {
        assertThatThrownBy(() -> schoolService.createSchool(" ", "Muscat"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("School name must not be blank");

        verifyNoInteractions(schoolRepository);
    }

    @Test
    void getByIdRejectsInactiveSchool() {
        School school = new School();
        school.setId(7L);
        school.setIsActive(false);
        when(schoolRepository.findById(7L)).thenReturn(Optional.of(school));

        assertThatThrownBy(() -> schoolService.getById(7L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("School not found with id: 7");
    }

    @Test
    void deleteByIdReturnsFalseWhenSchoolDoesNotExist() {
        when(schoolRepository.getById(99L)).thenReturn(null);

        assertThat(schoolService.deleteById(99L)).isFalse();
    }
}
