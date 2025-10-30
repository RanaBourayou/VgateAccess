package visteon.gestionacces.ServicesImpl;

import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.Entities.VisitRequestStatus;
import visteon.gestionacces.Repositories.VisitRequestRepository;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MailNotificationService {
    private final JavaMailSender mailSender;
    private final VisitRequestRepository visitRequestRepository;
    private final JWTTokenService jwtTokenService;
    private final TaskScheduler taskScheduler;


    private static final Logger logger = LoggerFactory.getLogger(MailNotificationService.class);
    @Value("bourayourana8@gmail.com")
    private String defaultSender;

    public MailNotificationService(JavaMailSender mailSender,
                                   VisitRequestRepository visitRequestRepository,
                                   JWTTokenService jwtTokenService, TaskScheduler taskScheduler) {
        this.mailSender = mailSender;
        this.visitRequestRepository = visitRequestRepository;
        this.jwtTokenService = jwtTokenService;
        this.taskScheduler = taskScheduler;
    }

    public void sendNotification(String token, Long requestId, String visitStatus) {
        VisitRequest request = visitRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("VisitRequest not found"));

        // Extract receptionist info from JWT
        Claims claims = jwtTokenService.extractAllClaims(token);
        String receptionistEmail = claims.get("email", String.class);
        String receptionistName = claims.get("firstName", String.class) + " " + claims.get("lastName", String.class);
        String requesterName = request.getRequester().getFirstName();
        String requesterEmail = request.getRequester().getEmail();

        // Determine sender
        String senderEmail = receptionistEmail != null && !receptionistEmail.isEmpty() ?
                receptionistEmail : defaultSender;

        // Format visitor name
        String visitorName = request.getVisitor() != null ?
                request.getVisitor().getFirstName() + " " + request.getVisitor().getLastName() : "Visitor";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(requesterEmail);
            helper.setSubject("Visitor Status Update: " + visitorName);
            helper.setFrom(senderEmail);
            helper.setReplyTo(senderEmail);

            // HTML email content
            String htmlContent = buildEmailContent(request, receptionistName, visitorName, visitStatus);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
    private String buildEmailContent(VisitRequest request, String receptionistName,
                                     String visitorName, String visitStatus) {

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");

        String visitDate       = request.getVisitDate().format(dateFormatter);
        String arrivalTime     = request.getExpectedArrival().format(timeFormatter);
        String departureTime   = request.getExpectedDeparture().format(timeFormatter);
        String companyName     = request.getVisitor() != null
                ? request.getVisitor().getCompanyName(): "N/A"
                ;
        String contactPerson   = request.getPersonneConcernee() != null
                ? request.getPersonneConcernee()
                : "N/A";

        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta charset=\"UTF-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "  <title>Visitor Status Update</title>" +
                "  <style>" +
                "    * { margin:0; padding:0; box-sizing:border-box; }" +
                "" +
                "    /* Light mode defaults */" +
                "    body { background:#f5f5f5; color:#333; }" +
                "    .card { background:#fff; color:#333; box-shadow:0 4px 12px rgba(0,0,0,0.05); }" +
                "" +
                "    /* Dark mode overrides */" +
                "    @media (prefers-color-scheme: dark) {" +
                "      body { background:#121212; color:#eee; }" +
                "      .card { background:#1e1e1e; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.4); }" +
                "    }" +
                "" +
                "    body { font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding:20px; }" +
                "    .card { border-radius:12px; padding:24px; max-width:600px; margin:auto; }" +
                "" +
                "    .visitor-name { font-size:22px; font-weight:600; margin-bottom:8px; }" +
                "    .status { font-size:18px; font-weight:500; color:#ff9100; margin-bottom:24px; }" +
                "" +
                "    .detail-item { margin-bottom:16px; }" +
                "    .detail-label { font-size:14px; color:inherit; opacity:0.7; text-transform:uppercase; margin-bottom:4px; }" +
                "    .detail-value { font-size:16px; font-weight:500; }" +
                "" +
                "    .divider { height:1px; background:currentColor; opacity:0.2; margin:24px 0; }" +
                "" +
                "    .action-title { font-size:16px; font-weight:500; margin-bottom:12px; }" +
                "" +
                "    .action-buttons { display:flex; gap:16px; /* slightly more space */ }" +
                "" +
                "    .btn { flex:1; text-align:center; padding:10px 0; border-radius:6px; font-size:14px; font-weight:500; color:#fff; text-decoration:none; }" +
                "    .btn-approve { background:#22c55e; }" +
                "    .btn-reject  { background:#ef4444; }" +
                "    .btn-waiting { background:#f59e0b; }" +
                "" +
                "    .updated-by { font-size:14px; color:inherit; opacity:0.7; margin-top:24px; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class=\"card\">" +
                "    <div class=\"visitor-name\">" + visitorName + "</div>" +
                "    <div class=\"status\">" + visitStatus + "</div>" +
                "" +
                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Date</div>" +
                "      <div class=\"detail-value\">" + visitDate + "</div>" +
                "    </div>" +
                "" +
                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Time</div>" +
                "      <div class=\"detail-value\">" + arrivalTime + " – " + departureTime + "</div>" +
                "    </div>" +
                "" +
                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Company</div>" +
                "      <div class=\"detail-value\">" + companyName + "</div>" +
                "    </div>" +
                "" +
                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Contact Person</div>" +
                "      <div class=\"detail-value\">" + contactPerson + "</div>" +
                "    </div>" +
                "" +
                "    <div class=\"divider\"></div>" +
                "" +
                "    <div class=\"action-title\">Update status:</div>" +
                "    <div class=\"action-buttons\">" +
                "      <a href=\"http://localhost:8080/visteonS/api/visit-requests/notify/action?requestId="
                + request.getIdVisitRequest()
                + "&status=APPROVED\""
                + " class=\"btn btn-approve\" style=\"margin-right:12px;\">✓ APPROVE</a>" +
                "      <a href=\"http://localhost:8080/visteonS/api/visit-requests/notify/action?requestId="
                + request.getIdVisitRequest()
                + "&status=REJECTED\""
                + " class=\"btn btn-reject\" style=\"margin-right:12px;\">✕ REJECT</a>" +
                "      <a href=\"http://localhost:8080/visteonS/api/visit-requests/notify/action?requestId="
                + request.getIdVisitRequest()
                + "&status=WAITING\""
                + " class=\"btn btn-waiting\">⌛ WAIT</a>" +
                "    </div>" +


                "" +
                "    <div class=\"updated-by\">Updated by " + receptionistName + "</div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    private String buildReminderEmailContent(VisitRequest request, String receptionistName,
                                             String visitorName, String visitStatus) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");

        String visitDate = request.getVisitDate().format(dateFormatter);
        String arrivalTime = request.getExpectedArrival().format(timeFormatter);
        String departureTime = request.getExpectedDeparture().format(timeFormatter);
        String companyName = request.getVisitor() != null ? request.getVisitor().getCompanyName() : "N/A";
        String contactPerson = request.getPersonneConcernee() != null ? request.getPersonneConcernee() : "N/A";

        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta charset=\"UTF-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "  <title>Reminder: Visitor Still Waiting</title>" +
                "  <style>" +
                "    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; padding:20px; margin:0; background:#f5f5f5; color:#333; }" +
                "    .card { background:#fff; color:#333; border-radius:12px; padding:24px; max-width:600px; margin:auto; box-shadow:0 4px 12px rgba(0,0,0,0.05); }" +
                "    @media (prefers-color-scheme: dark) {" +
                "      body { background:#121212; color:#eee; }" +
                "      .card { background:#1e1e1e; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.4); }" +
                "    }" +
                "    .visitor-name { font-size:22px; font-weight:600; margin-bottom:8px; }" +
                "    .status { font-size:18px; font-weight:500; color:#ff9100; margin-bottom:24px; }" +
                "    .detail-item { margin-bottom:16px; }" +
                "    .detail-label { font-size:14px; opacity:0.7; text-transform:uppercase; margin-bottom:4px; }" +
                "    .detail-value { font-size:16px; font-weight:500; }" +
                "    .divider { height:1px; background:currentColor; opacity:0.2; margin:24px 0; }" +
                "    .action-title { font-size:16px; font-weight:500; margin-bottom:12px; }" +
                "    .action-buttons { display:flex; gap:12px; flex-wrap:wrap; }" +
                "    .btn { flex:1; text-align:center; padding:10px 0; border-radius:6px; font-size:14px; font-weight:500; color:#fff; text-decoration:none; }" +
                "    .btn-approve { background:#22c55e; }" +
                "    .btn-reject  { background:#ef4444; }" +
                "    .btn-waiting { background:#f59e0b; }" +
                "    .updated-by { font-size:14px; opacity:0.7; margin-top:24px; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class=\"card\">" +
                "    <div class=\"visitor-name\">" + visitorName + "</div>" +
                "    <div class=\"status\">Reminder: Your visitor is still <strong>" + visitStatus.toLowerCase() + "</strong></div>" +

                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Date</div>" +
                "      <div class=\"detail-value\">" + visitDate + "</div>" +
                "    </div>" +

                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Time</div>" +
                "      <div class=\"detail-value\">" + arrivalTime + " – " + departureTime + "</div>" +
                "    </div>" +

                "    <div class=\"detail-item\">" +
                "      <div class=\"detail-label\">Company</div>" +
                "      <div class=\"detail-value\">" + companyName + "</div>" +
                "    </div>"  +

                "    <div class=\"divider\"></div>" +

                "    <div class=\"action-title\">Update status:</div>" +
                "    <div class=\"action-buttons\">" +
                "      <a href=\"http://localhost:8080/visteonS/api/visit-requests/notify/action?requestId=" + request.getIdVisitRequest() + "&status=APPROVED\" class=\"btn btn-approve\">✓ APPROVE</a>" +
                "      <a href=\"http://localhost:8080/visteonS/api/visit-requests/notify/action?requestId=" + request.getIdVisitRequest() + "&status=REJECTED\" class=\"btn btn-reject\">✕ REJECT</a>" +
                "      <a href=\"http://localhost:8080/visteonS/api/visit-requests/notify/action?requestId=" + request.getIdVisitRequest() + "&status=WAITING\" class=\"btn btn-waiting\">⌛ WAIT</a>" +
                "    </div>" +

                "    <div class=\"updated-by\">Reminder sent by " + receptionistName + "</div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
    public void scheduleReminderEmail(String token, Long requestId) {
        Instant reminderTime = Instant.now().plusSeconds(3); // 15 minutes

        taskScheduler.schedule(() -> {
            VisitRequest request = visitRequestRepository.findById(requestId).orElse(null);
            if (request != null && request.getVisitRequestStatus() == VisitRequestStatus.WAITING) {
                Claims claims = jwtTokenService.extractAllClaims(token);
                String receptionistName = claims.get("firstName", String.class) + " " + claims.get("lastName", String.class);
                String recipientEmail = request.getRequester().getEmail();
                String visitorName = request.getVisitor() != null
                        ? request.getVisitor().getFirstName() + " " + request.getVisitor().getLastName()
                        : "Visitor";

                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                    helper.setTo(recipientEmail);
                    helper.setSubject("⏰ Reminder: Visitor Still Waiting");
                    helper.setFrom(defaultSender);
                    helper.setText(buildReminderEmailContent(request, receptionistName, visitorName, "WAITING"), true);

                    mailSender.send(message);
                    logger.info(" reminder email sent successfully for request ID: {}", requestId);

                } catch (MessagingException e) {
                    e.printStackTrace();
                    logger.error("Failed to send reminder email for request ID: {}", requestId, e);

                }
            }
        }, Date.from(reminderTime));
    }

    public void sendPinCodeEmail(String token, VisitRequest request) {
        if (request == null || request.getVisitor() == null) {
            throw new IllegalArgumentException("Request or Visitor is null");
        }

        int pinCode = request.getPinCode();
        String visitorEmail = request.getVisitor().getEmail();
        String visitorName = request.getVisitor().getFirstName() + " " + request.getVisitor().getLastName();

        // currently connected requester info from token
        Claims claims = jwtTokenService.extractAllClaims(token);
        String requesterEmail = claims.get("email", String.class);
        String requesterName = claims.get("firstName", String.class) + " " + claims.get("lastName", String.class);

        try {
            // Email to currently logged-in Requester
            if (isValidEmailAddress(requesterEmail)) {
                MimeMessage messageRequester = mailSender.createMimeMessage();
                MimeMessageHelper helperRequester = new MimeMessageHelper(messageRequester, true, "UTF-8");

                helperRequester.setTo(requesterEmail);
                helperRequester.setSubject("🔐 Visitor Access Code");
                helperRequester.setFrom(defaultSender);

                String contentForRequester = buildPinCodeEmailContent(requesterName, visitorName, pinCode, request);
                helperRequester.setText(contentForRequester, true);

                mailSender.send(messageRequester);
                logger.info("PIN code email sent to **logged-in requester** {} for visit ID {}", requesterEmail, request.getIdVisitRequest());
            }

            // Email to Visitor
            if (isValidEmailAddress(visitorEmail)) {
                MimeMessage messageVisitor = mailSender.createMimeMessage();
                MimeMessageHelper helperVisitor = new MimeMessageHelper(messageVisitor, true, "UTF-8");

                helperVisitor.setTo(visitorEmail);
                helperVisitor.setSubject("🔐 Your Access Code");
                helperVisitor.setFrom(defaultSender);

                String contentForVisitor = buildPinCodeEmailContent(requesterName, visitorName, pinCode, request);
                helperVisitor.setText(contentForVisitor, true);

                mailSender.send(messageVisitor);
                logger.info("PIN code email sent to visitor {} for visit ID {}", visitorEmail, request.getIdVisitRequest());
            }

        } catch (MessagingException e) {
            logger.error("Failed to send PIN code email for visit ID {}", request.getIdVisitRequest(), e);
            throw new RuntimeException("Failed to send PIN code email", e);
        }
    }

    private boolean isValidEmailAddress(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        try {
            InternetAddress emailAddr = new InternetAddress(email);
            emailAddr.validate();
            return true;
        } catch (jakarta.mail.internet.AddressException ex) {
            logger.warn("Invalid email address: {}", email);
            return false;
        }
    }
    private String buildPinCodeEmailContent(String requesterName, String visitorName, int pinCode, VisitRequest request) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");

        String visitDate = request.getVisitDate().format(dateFormatter);
        String arrivalTime = request.getExpectedArrival().format(timeFormatter);

        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta charset=\"UTF-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "  <title>Access Code</title>" +
                "  <style>" +
                "    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "    .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "    .header { color: #0a7bff; font-size: 24px; margin-bottom: 20px; }" +
                "    .pin-code { " +
                "      font-size: 28px; " +
                "      font-weight: bold; " +
                "      color: #0a7bff; " +
                "      margin: 20px 0; " +
                "      padding: 10px; " +
                "      background: #f5f9ff; " +
                "      border-radius: 5px; " +
                "      display: inline-block; " +
                "    }" +
                "    .footer { margin-top: 30px; font-size: 12px; color: #888; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class=\"container\">" +
                "    <h2 class=\"header\">Hello </h2>" +
                "    <p>The access code (PIN) for visitor <strong>" + visitorName + "</strong> is:</p>" +
                "    <p><strong>Visit Date:</strong> " + visitDate + "</p>" +
                "    <p><strong>Arrival Time:</strong> " + arrivalTime + "</p>" +
                "    <div class=\"pin-code\">" + pinCode + "</div>" +
                "    <p>Please provide this code to gain access at the reception.</p>" +
                "    <div class=\"footer\">" +
                "      <p>Sent automatically by Visteon Access System</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }





    public void sendAccountCreationEmail(String recipientEmail, String recipientName, String rawPassword) {
        if (!isValidEmailAddress(recipientEmail)) {
            logger.warn("Invalid email address: {}", recipientEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(recipientEmail);
            helper.setSubject("Welcome to Visteon - Your Account Credentials");
            helper.setFrom(defaultSender);

            String content = """
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2d3748;
        }
        .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: #003366; /* Dark blue */
            padding: 30px 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 30px;
        }
        .welcome {
            font-size: 20px;
            margin-bottom: 25px;
            color: #1a202c;
        }
        .credentials-box {
            background: #fffaf5;
            border: 1px solid #ffedd5;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #ff6b00; /* Orange accent */
        }
        .credentials-box p {
            margin: 12px 0;
            font-size: 16px;
        }
        .label {
            color: #4a5568;
            font-weight: 500;
            display: inline-block;
            width: 90px;
        }
        .highlight {
            color: #dd6b20; /* Orange text */
            font-weight: 600;
        }
        .security-note {
            background: #ebf8ff;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3182ce;
            margin: 25px 0;
        }
        .footer {
            padding: 20px 30px;
            background: #edf2f7;
            color: #718096;
            font-size: 14px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .button {
            display: inline-block;
            margin: 15px 0;
            padding: 12px 30px;
            background: #ff6b00; /* Orange */
            color: white !important;
            text-decoration: none;
            font-weight: 600;
            border-radius: 6px;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Visteon Access System</h1>
        </div>
        
        <div class="content">
            <div class="welcome">
                Hello <strong>%s</strong>,
            </div>
            
            <p>Your account has been successfully created on the Visteon Access System platform.</p>
            
            <div class="credentials-box">
                <p><span class="label">Email:</span> <span class="highlight">%s</span></p>
                <p><span class="label">Password:</span> <span class="highlight">%s</span></p>
            </div>
            
            <div class="security-note">
                <p>🔒 <strong>Security Recommendation:</strong> Please change your password immediately after first login.</p>
            </div>
            
            <p>To access your account:</p>
            <a href="https://access.visteon.com/login" class="button">Login to Portal</a>
            
             
            <p style="margin-top: 25px;">
                Best regards,<br>
                <strong style="color: #003366;">Visteon Security Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
           
        </div>
            </div>
        </body>
        </html>
        """.formatted(recipientName, recipientEmail, rawPassword);

            helper.setText(content, true);
            mailSender.send(message);

            logger.info("Account creation email sent to: {}", recipientEmail);
        } catch (MessagingException e) {
            logger.error("Error sending account creation email: {}", e.getMessage(), e);
        }
    }



}