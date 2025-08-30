package com.lifelineai.backend.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.lifelineai.backend.repository")
@EntityScan(basePackages = "com.lifelineai.backend.entity")
@EnableJpaAuditing
@EnableTransactionManagement
public class DatabaseConfig {
}