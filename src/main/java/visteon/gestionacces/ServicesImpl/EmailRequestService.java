package visteon.gestionacces.ServicesImpl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.EmailRequest;

@Service
public class EmailRequestService {
    private final JavaMailSender mailSender;

    public EmailRequestService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(EmailRequest request) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(request.getFrom());
        helper.setTo(request.getTo());
        helper.setSubject(request.getSubject());
        helper.setText(request.getMessage(), true);

        mailSender.send(message);
    }
}