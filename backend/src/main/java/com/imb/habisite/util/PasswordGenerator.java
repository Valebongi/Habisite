package com.imb.habisite.util;

import java.security.SecureRandom;

/**
 * Generador de contraseñas seguras y legibles.
 * Excluye caracteres ambiguos: 0/O, 1/l/I para facilitar la lectura por email.
 */
public final class PasswordGenerator {

    private static final String CHARS =
        "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int LENGTH = 12;

    private PasswordGenerator() {}

    /** Genera una contraseña aleatoria de 12 caracteres alfanuméricos legibles. */
    public static String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
