package visteon.gestionacces.RestController;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.Entities.EmailRequest;
import visteon.gestionacces.ServicesImpl.EmailRequestService;

@Controller
@RequestMapping("/api/email-requests")
public class EmailRequestController {
    private final EmailRequestService emailService;

    public EmailRequestController(EmailRequestService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/api")
    public String showForm(Model model) {
        model.addAttribute("emailRequest", new EmailRequest());
        return "email_form"; // points to email_form.html
    }

    // Process the form on POST to /api
    @PostMapping("/api")
    public String sendEmail(@ModelAttribute EmailRequest emailRequest, Model model) {
        try {
            emailService.sendEmail(emailRequest);
            model.addAttribute("success", true);
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }

        model.addAttribute("emailRequest", new EmailRequest()); // reset form
        return "email_form";
    }
}
