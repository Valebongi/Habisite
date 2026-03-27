package com.imb.habisite.service;

import com.imb.habisite.dto.LoginRequestDTO;
import com.imb.habisite.dto.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
}
