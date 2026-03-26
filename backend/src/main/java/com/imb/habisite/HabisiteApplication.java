package com.imb.habisite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class HabisiteApplication {
    public static void main(String[] args) {
        SpringApplication.run(HabisiteApplication.class, args);
    }
}
