package com.lifelineai.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Lifeline AI Backend");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Lifeline AI");
        response.put("version", "0.0.1");
        response.put("description", "Emergency response and health monitoring system");
        return response;
    }

    @PostMapping("/emergency")
    public Map<String, Object> reportEmergency(@RequestBody Map<String, Object> emergencyData) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "received");
        response.put("emergencyId", System.currentTimeMillis());
        response.put("data", emergencyData);
        response.put("message", "Emergency reported successfully");
        return response;
    }
}