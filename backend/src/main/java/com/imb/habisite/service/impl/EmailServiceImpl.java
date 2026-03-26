package com.imb.habisite.service.impl;

import com.imb.habisite.model.Postulante;
import com.imb.habisite.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Override
    @Async
    public void enviarConfirmacionPostulacion(Postulante postulante) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(postulante.getCorreoElectronico());
            helper.setSubject("¡Gracias por postularte a Habisite!");
            helper.setText(construirHtml(postulante), true);

            mailSender.send(mensaje);
            log.info("Email de confirmación enviado a: {}", postulante.getCorreoElectronico());

        } catch (MessagingException e) {
            // El email falla silenciosamente para no afectar el registro
            log.error("Error enviando email de confirmación a {}: {}", postulante.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirHtml(Postulante p) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',system-ui,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">

                          <!-- Header -->
                          <tr>
                            <td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.5px;">
                                Habisite
                              </h1>
                              <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;">
                                Concurso de innovación arquitectónica
                              </p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:40px 40px 32px;">
                              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">
                                ¡Hola, %s!
                              </p>
                              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                                Recibimos tu postulación al concurso de innovación arquitectónica de Habisite.
                                Estamos muy contentos de que quieras ser parte de esta iniciativa.
                              </p>

                              <!-- Data box -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:20px 24px;">
                                    <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">
                                      Datos registrados
                                    </p>
                                    %s
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                                En los próximos días te contactaremos con más información sobre las
                                etapas del concurso. Mientras tanto, si tenés alguna consulta podés
                                responder este correo.
                              </p>

                              <p style="margin:0;font-size:15px;color:#4b5563;">
                                ¡Mucho éxito!<br/>
                                <strong style="color:#111827;">El equipo de Habisite</strong>
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#9ca3af;">
                                Este correo fue enviado automáticamente. Por favor no lo reenvíes.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                p.getNombres(),
                filasDatos(p)
        );
    }

    private String filasDatos(Postulante p) {
        return fila("Nombre completo", p.getNombres() + " " + p.getApellidos())
             + fila("DNI",             p.getDni())
             + fila("Universidad",     p.getUniversidad())
             + fila("Especialidad",    p.getEspecialidad())
             + fila("Correo",          p.getCorreoElectronico());
    }

    private String fila(String label, String valor) {
        return """
               <p style="margin:0 0 6px;font-size:14px;color:#374151;">
                 <span style="font-weight:600;">%s:</span> %s
               </p>
               """.formatted(label, valor);
    }
}
