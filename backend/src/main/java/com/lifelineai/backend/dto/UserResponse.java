package com.lifelineai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String profileDescription;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private List<String> medicalConditions;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}