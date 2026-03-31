package com.imb.habisite.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    /**
     * DataSource unificado para Railway y desarrollo local.
     *
     * Railway provee DATABASE_URL en formato postgresql://user:pass@host:port/db.
     * Si no está disponible, usa las variables individuales PGHOST/PGPORT/etc.
     * Todos los valores se trimean para evitar caracteres invisibles (\t, \n, espacios).
     */
    @Bean
    public DataSource dataSource(
            @Value("${DATABASE_URL:}")   String databaseUrl,
            @Value("${PGHOST:localhost}") String pgHost,
            @Value("${PGPORT:5432}")      String pgPort,
            @Value("${PGDATABASE:habisite}") String pgDatabase,
            @Value("${PGUSER:habisite_user}") String pgUser,
            @Value("${PGPASSWORD:habisite_pass}") String pgPassword) {

        HikariConfig cfg = new HikariConfig();

        if (!databaseUrl.isBlank()) {
            URI uri = URI.create(databaseUrl.trim());
            String[] parts = uri.getUserInfo().split(":", 2);
            String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";
            cfg.setJdbcUrl("jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath() + query);
            cfg.setUsername(parts[0].trim());
            cfg.setPassword(parts.length > 1 ? parts[1].trim() : "");
        } else {
            cfg.setJdbcUrl("jdbc:postgresql://" + pgHost.trim() + ":" + pgPort.trim() + "/" + pgDatabase.trim());
            cfg.setUsername(pgUser.trim());
            cfg.setPassword(pgPassword.trim());
        }

        cfg.setMaximumPoolSize(5);
        cfg.setConnectionTimeout(20_000);
        return new HikariDataSource(cfg);
    }
}
