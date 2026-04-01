package com.imb.habisite.service.impl;

import com.imb.habisite.model.Concurso;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.SoporteTicket;
import org.springframework.web.util.HtmlUtils;
import com.imb.habisite.service.EmailService;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
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

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
                                Concurso de innovación arquitectónica
                              </p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px 28px;">
                              <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827;">
                                ¡Hola, %s!
                              </p>
                              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                                Recibimos tu postulación al concurso de innovación arquitectónica de Habisite.
                                Estamos muy contentos de que quieras ser parte de esta iniciativa.
                              </p>

                              <!-- Datos registrados -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:20px 24px;">
                                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">
                                      Datos registrados
                                    </p>
                                    %s
                                    %s
                                    %s
                                    %s
                                    %s
                                  </td>
                                </tr>
                              </table>

                              <!-- Credenciales -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="background:#fff8f5;border:2px solid #E85520;border-radius:10px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:22px 24px;">
                                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#E85520;text-transform:uppercase;letter-spacing:.08em;">
                                      Tus credenciales de acceso
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

                              <!-- Aviso acceso web -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:18px 22px;">
                                    <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">
                                      <strong>Próximamente</strong> se habilitará el acceso completo a la plataforma web.
                                      Cuando esté disponible, podrás ingresar con estas credenciales desde
                                      <strong>concursos.habisite.com</strong>.
                                      Te notificaremos por este mismo correo.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0;font-size:15px;color:#4b5563;">
                                En los próximos días te contactaremos con más información sobre las etapas del concurso.
                                Mientras tanto, si tenés alguna consulta podés responder este correo.<br/><br/>
                                ¡Mucho éxito!<br/>
                                <strong style="color:#111827;">El equipo de Habisite</strong>
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#9ca3af;">
                                Guardá tus credenciales en un lugar seguro. No las compartas con nadie.
                              </p>
                              %s
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                esc(p.getNombres()),
                fila("Nombre completo", p.getNombres() + " " + p.getApellidos()),
                fila("DNI", p.getDni()),
                fila("Universidad", p.getUniversidad()),
                fila("Especialidad", p.getEspecialidad()),
                fila("Correo", p.getCorreoElectronico()),
                esc(p.getDni()),
                esc(plainPassword),
                footerConBaja(p.getTokenConfirmacion())
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
                esc(t.getMensaje()),
                t.getId()
        );
    }

    // ── Paso 2a: Info detallada del concurso + link de confirmación ────────────

    @Override
    @Async
    public void enviarInfoConcurso(Postulante postulante, Concurso concurso, String confirmacionUrl) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(mailFrom, "Habisite Challenge");
            helper.setTo(postulante.getCorreoElectronico());
            helper.setSubject("Informacion detallada del concurso — Habisite Design Challenge");
            helper.setText(construirHtmlInfoConcurso(postulante, concurso, confirmacionUrl), true);

            mailSender.send(mensaje);
            log.info("Email de info concurso enviado a: {}", postulante.getCorreoElectronico());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando info concurso a {}: {}", postulante.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirHtmlInfoConcurso(Postulante p, Concurso c, String url) {
        var dtf = DateTimeFormatter.ofPattern("d 'de' MMMM yyyy", new Locale("es", "AR"));
        String fechaInicio = c.getFechaInicio().format(dtf);
        String fechaFin = c.getFechaFin().format(dtf);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',system-ui,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr><td align="center">
                      <table width="560" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">

                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#0d0e10 0%%,#2a1208 100%%);padding:32px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.12em;">HABISITE</p>
                            <p style="margin:0;font-size:11px;font-weight:600;color:#E85520;letter-spacing:.22em;text-transform:uppercase;">
                              Concurso de innovacion arquitectonica
                            </p>
                          </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                          <td style="padding:36px 40px 28px;">
                            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827;">
                              Hola, %s
                            </p>
                            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                              Te escribimos porque te registraste en el concurso <strong>%s</strong>.
                              Queremos compartirte la informacion completa para que puedas participar.
                            </p>

                            <!-- Info del concurso -->
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
                              <tr>
                                <td style="padding:20px 24px;">
                                  <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">
                                    Detalles del concurso
                                  </p>
                                  %s
                                  %s
                                  %s
                                </td>
                              </tr>
                            </table>

                            <!-- Descripcion -->
                            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">
                              Objetivos y vision
                            </p>
                            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.7;background:#f8fafc;padding:16px;border-radius:8px;">
                              %s
                            </p>

                            <!-- Recompensa -->
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#fff8f5;border:2px solid #E85520;border-radius:10px;margin-bottom:28px;">
                              <tr>
                                <td style="padding:20px 24px;">
                                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#E85520;text-transform:uppercase;letter-spacing:.08em;">
                                    Recompensa economica y profesional
                                  </p>
                                  <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
                                    Los participantes seleccionados obtendran visibilidad profesional, reconocimiento
                                    en la industria y premios economicos. Los detalles completos se encuentran en las
                                    bases y condiciones del concurso.
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <!-- CTA -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="padding:8px 0 24px;">
                                  <p style="margin:0 0 14px;font-size:15px;color:#374151;font-weight:600;">
                                    Para confirmar tu participacion oficial, hace click en el siguiente boton:
                                  </p>
                                  <a href="%s"
                                     style="display:inline-block;background:#E85520;color:#ffffff;padding:14px 36px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:.03em;">
                                    Confirmar mi participacion
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
                              Si no te registraste en este concurso, podes ignorar este correo.
                            </p>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                              Habisite Design Challenge · Este correo fue enviado automaticamente.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(
                esc(p.getNombres()),
                esc(c.getTitulo()),
                fila("Concurso", c.getTitulo()),
                fila("Periodo", fechaInicio + " — " + fechaFin),
                fila("Estado", c.getEstado()),
                esc(c.getDescripcion()),
                esc(url)
        );
    }

    // ── Paso 2b: Confirmación exitosa + webinar + canal ─────────────────────

    @Override
    @Async
    public void enviarConfirmacionExitosa(Postulante postulante, Concurso concurso) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(mailFrom, "Habisite Challenge");
            helper.setTo(postulante.getCorreoElectronico());
            helper.setSubject("Inscripcion oficial confirmada — Habisite Design Challenge");
            helper.setText(construirHtmlConfirmacion(postulante, concurso), true);

            mailSender.send(mensaje);
            log.info("Email de confirmacion exitosa enviado a: {}", postulante.getCorreoElectronico());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando confirmacion a {}: {}", postulante.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirHtmlConfirmacion(Postulante p, Concurso c) {
        var dtf = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM yyyy, HH:mm 'hs'", new Locale("es", "AR"));
        String fechaWebinar = c.getWebinarFecha() != null ? c.getWebinarFecha().format(dtf) : "A confirmar";
        String canalNombre = c.getCanalNombre() != null && !c.getCanalNombre().isBlank() ? c.getCanalNombre() : "Canal";

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',system-ui,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr><td align="center">
                      <table width="560" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">

                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#0d0e10 0%%,#2a1208 100%%);padding:32px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.12em;">HABISITE</p>
                            <p style="margin:0;font-size:11px;font-weight:600;color:#E85520;letter-spacing:.22em;text-transform:uppercase;">
                              Inscripcion confirmada
                            </p>
                          </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                          <td style="padding:36px 40px 28px;">
                            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#16a34a;">
                              Tu participacion fue confirmada
                            </p>
                            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                              <strong>%s</strong>, ya estas oficialmente inscripto/a en el <strong>%s</strong>.
                              A continuacion te compartimos informacion importante sobre los proximos pasos.
                            </p>

                            <!-- Webinar -->
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:20px;">
                              <tr>
                                <td style="padding:20px 24px;">
                                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:.08em;">
                                    Reunion explicativa — Webinar
                                  </p>
                                  %s
                                  <a href="%s"
                                     style="display:inline-block;margin-top:12px;background:#1e40af;color:#ffffff;padding:10px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">
                                    Unirme al Webinar
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <!-- Canal -->
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
                              <tr>
                                <td style="padding:20px 24px;">
                                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;">
                                    Canal de comunicacion — %s
                                  </p>
                                  <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.5;">
                                    Unite al canal oficial donde compartiremos novedades, material de apoyo y
                                    podras hacer consultas en tiempo real.
                                  </p>
                                  <a href="%s"
                                     style="display:inline-block;background:#16a34a;color:#ffffff;padding:10px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">
                                    Unirme al %s
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;">
                              Ante cualquier consulta podes responder este correo.<br/><br/>
                              <strong style="color:#111827;">El equipo de Habisite</strong>
                            </p>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                              Habisite Design Challenge · Este correo fue enviado automaticamente.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(
                esc(p.getNombres()),
                esc(c.getTitulo()),
                fila("Fecha", fechaWebinar),
                esc(c.getWebinarUrl() != null ? c.getWebinarUrl() : "#"),
                esc(canalNombre),
                esc(c.getCanalUrl() != null ? c.getCanalUrl() : "#"),
                esc(canalNombre)
        );
    }

    // ── Paso 3: Segunda convocatoria (recordatorio) ─────────────────────────

    @Override
    @Async
    public void enviarSegundaConvocatoria(Postulante postulante, Concurso concurso, String confirmacionUrl) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(mailFrom, "Habisite Challenge");
            helper.setTo(postulante.getCorreoElectronico());
            helper.setSubject("Ultima oportunidad — Confirma tu participacion en Habisite");
            helper.setText(construirHtmlSegundaConvocatoria(postulante, concurso, confirmacionUrl), true);

            mailSender.send(mensaje);
            log.info("Email de 2da convocatoria enviado a: {}", postulante.getCorreoElectronico());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando 2da convocatoria a {}: {}", postulante.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirHtmlSegundaConvocatoria(Postulante p, Concurso c, String url) {
        var dtf = DateTimeFormatter.ofPattern("d 'de' MMMM yyyy", new Locale("es", "AR"));
        String fechaFin = c.getFechaFin().format(dtf);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',system-ui,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr><td align="center">
                      <table width="560" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">

                        <!-- Header urgente -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#7f1d1d 0%%,#E85520 100%%);padding:32px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.12em;">HABISITE</p>
                            <p style="margin:0;font-size:11px;font-weight:600;color:#fbbf24;letter-spacing:.22em;text-transform:uppercase;">
                              Ultima oportunidad
                            </p>
                          </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                          <td style="padding:36px 40px 28px;">
                            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827;">
                              %s, todavia no confirmaste tu participacion
                            </p>
                            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                              Te registraste en el <strong>%s</strong> pero aun no confirmaste tu inscripcion oficial.
                              Las inscripciones cierran el <strong>%s</strong>.
                            </p>

                            <!-- Alerta -->
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#fff7ed;border-left:4px solid #E85520;border-radius:4px;margin-bottom:24px;">
                              <tr>
                                <td style="padding:16px 20px;">
                                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                                    <strong>Esta es tu ultima oportunidad</strong> para confirmar tu participacion.
                                    Si no confirmas antes del cierre, no podras participar del concurso.
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <!-- CTA -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="padding:8px 0 24px;">
                                  <a href="%s"
                                     style="display:inline-block;background:#E85520;color:#ffffff;padding:16px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:.03em;">
                                    Confirmar mi participacion ahora
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
                              Si ya no deseas participar, simplemente ignora este correo.<br/>
                              Ante cualquier consulta podes responder este email.
                            </p>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                              Habisite Design Challenge · 2da convocatoria.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(
                esc(p.getNombres()),
                esc(c.getTitulo()),
                esc(fechaFin),
                esc(url)
        );
    }

    // ── Bienvenida post-confirmación ────────────────────────────────────────

    @Override
    @Async
    public void enviarBienvenidaConfirmado(Postulante postulante) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(mailFrom, "Habisite Challenge");
            helper.setTo(postulante.getCorreoElectronico());
            helper.setSubject("¡Tu inscripción fue confirmada! — Habisite Design Challenge");
            helper.setText(construirHtmlBienvenida(postulante), true);
            mailSender.send(mensaje);
            log.info("Email de bienvenida enviado a: {}", postulante.getCorreoElectronico());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando bienvenida a {}: {}", postulante.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirHtmlBienvenida(Postulante p) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"/></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',system-ui,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr><td align="center">
                      <table width="560" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">
                        <tr>
                          <td style="background:linear-gradient(135deg,#0d0e10 0%%,#2a1208 100%%);padding:32px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.12em;">HABISITE</p>
                            <p style="margin:0;font-size:11px;font-weight:600;color:#E85520;letter-spacing:.22em;text-transform:uppercase;">
                              DESIGN CHALLENGE 2026
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:36px 40px 28px;">
                            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827;">
                              ¡Hola, %s!
                            </p>
                            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                              Tu inscripción al Habisite Design Challenge fue confirmada exitosamente.
                              Ya sos participante oficial.
                            </p>

                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;margin-bottom:24px;">
                              <tr>
                                <td style="padding:20px 24px;text-align:center;">
                                  <p style="margin:0 0 8px;font-size:1.4rem;color:#16a34a;">&#10003;</p>
                                  <p style="margin:0;font-size:15px;font-weight:700;color:#15803d;">
                                    Inscripción confirmada
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:24px;">
                              <tr>
                                <td style="padding:18px 22px;">
                                  <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">
                                    <strong>Próximos pasos:</strong><br/>
                                    Pronto te enviaremos otro correo con:<br/>
                                    • El link de la charla informativa del concurso<br/>
                                    • Tus datos de acceso al sistema<br/>
                                    • Acceso a la plataforma: <strong>concursos.habisite.com</strong>
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:0;font-size:15px;color:#4b5563;">
                              Mientras tanto, si tenés alguna consulta podés responder este correo.<br/><br/>
                              ¡Mucho éxito!<br/>
                              <strong style="color:#111827;">El equipo de Habisite</strong>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                              Habisite Design Challenge 2026
                            </p>
                            %s
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(esc(p.getNombres()), footerConBaja(p.getTokenConfirmacion()));
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private String esc(String s) {
        return s == null ? "" : HtmlUtils.htmlEscape(s);
    }

    private String footerConBaja(String token) {
        if (token == null || token.isBlank()) return "";
        String url = frontendUrl + "/baja?token=" + token;
        return """
               <p style="margin:8px 0 0;font-size:11px;color:#c0c0c0;text-align:center;">
                 <a href="%s" style="color:#9ca3af;text-decoration:underline;">Darme de baja del concurso</a>
               </p>
               """.formatted(esc(url));
    }

    private String fila(String label, String valor) {
        return """
               <p style="margin:0 0 6px;font-size:14px;color:#374151;">
                 <span style="font-weight:600;">%s:</span> %s
               </p>
               """.formatted(esc(label), esc(valor));
    }
}
