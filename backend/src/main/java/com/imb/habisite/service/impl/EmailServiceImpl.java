package com.imb.habisite.service.impl;

import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.SoporteTicket;
import com.imb.habisite.service.EmailService;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
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
    public void enviarCredenciales(Postulante postulante, String plainPassword) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(mailFrom, "Habisite Challenge");
            helper.setTo(postulante.getCorreoElectronico());
            helper.setSubject("Tus credenciales de acceso — Habisite Design Challenge");
            helper.setText(construirHtmlCredenciales(postulante, plainPassword), true);

            mailSender.send(mensaje);
            log.info("Email de credenciales enviado a: {}", postulante.getCorreoElectronico());

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando credenciales a {}: {}", postulante.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirHtmlCredenciales(Postulante p, String plainPassword) {
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
                            <td style="background:linear-gradient(135deg,#0d0e10 0%%,#2a1208 100%%);padding:32px 40px;text-align:center;">
                              <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.12em;">HABISITE</p>
                              <p style="margin:0;font-size:11px;font-weight:600;color:#E85520;letter-spacing:.22em;text-transform:uppercase;">
                                DESIGN CHALLENGE 2026
                              </p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px 28px;">
                              <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827;">
                                ¡Hola, %s!
                              </p>
                              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">
                                Tu cuenta en Habisite Design Challenge fue creada. A continuación encontrás
                                tus credenciales de acceso. Guardálas en un lugar seguro.
                              </p>

                              <!-- Credentials box -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="background:#fff8f5;border:2px solid #E85520;border-radius:10px;margin-bottom:28px;">
                                <tr>
                                  <td style="padding:24px 28px;">
                                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#E85520;text-transform:uppercase;letter-spacing:.08em;">
                                      Tus credenciales
                                    </p>
                                    <table width="100%%" cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td style="padding:8px 0;border-bottom:1px solid #fde8de;">
                                          <p style="margin:0;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Usuario</p>
                                          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#111827;letter-spacing:.06em;">%s</p>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="padding:8px 0 0;">
                                          <p style="margin:0;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Contraseña</p>
                                          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#111827;letter-spacing:.1em;font-family:monospace;">%s</p>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;background:#f9fafb;padding:14px 16px;border-radius:8px;border-left:3px solid #d1d5db;">
                                <strong style="color:#374151;">Importante:</strong> Tu usuario es tu número de DNI.
                                Podés cambiar tus datos de perfil una vez que ingreses al sistema.
                              </p>

                              <p style="margin:0;font-size:15px;color:#4b5563;">
                                ¡Mucho éxito en el concurso!<br/>
                                <strong style="color:#111827;">El equipo de Habisite</strong>
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#9ca3af;">
                                No compartas estas credenciales. Si creés que tu cuenta fue comprometida, contactá a la organización.
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
                p.getDni(),
                plainPassword
        );
    }

    @Override
    @Async
    public void notificarTicketSoporte(SoporteTicket ticket) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(mailFrom, "Habisite Challenge");
            helper.setTo("growthimbar@gmail.com");
            helper.setSubject("🎫 Nuevo ticket de soporte — Habisite");
            helper.setText(construirHtmlTicket(ticket), true);

            mailSender.send(mensaje);
            log.info("Notificación de ticket #{} enviada al admin.", ticket.getId());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando notificación de ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    private String construirHtmlTicket(SoporteTicket t) {
        String dni = t.getDni() != null && !t.getDni().isBlank() ? t.getDni() : "No informado";
        return """
                <!DOCTYPE html>
                <html lang="es">
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',system-ui,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr><td align="center">
                      <table width="520" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">
                        <tr>
                          <td style="background:#E85520;padding:28px 40px;">
                            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Nuevo ticket de soporte</h1>
                            <p style="margin:4px 0 0;color:#fff;opacity:.85;font-size:13px;">Habisite Design Challenge</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:32px 40px;">
                            %s
                            %s
                            <p style="margin:20px 0 0;font-size:14px;font-weight:600;color:#374151;">Mensaje:</p>
                            <p style="margin:6px 0 0;font-size:14px;color:#4b5563;line-height:1.6;background:#f8fafc;padding:14px;border-radius:8px;">%s</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">Ticket #%d · Revisá el panel de Admin para marcarlo como resuelto.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(
                fila("Nombre", t.getNombre()),
                fila("DNI", dni),
                t.getMensaje(),
                t.getId()
        );
    }

    private String fila(String label, String valor) {
        return """
               <p style="margin:0 0 6px;font-size:14px;color:#374151;">
                 <span style="font-weight:600;">%s:</span> %s
               </p>
               """.formatted(label, valor);
    }
}
