package visteon.gestionacces.RestController;

import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.DTO.VisitNotificationDTO;
import visteon.gestionacces.Entities.Companion;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.Entities.VisitRequestStatus;
import visteon.gestionacces.IServices.IVisitRequestServices;
import visteon.gestionacces.Repositories.VisitRequestRepository;
import visteon.gestionacces.ServicesImpl.MailNotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/visit-requests")
@CrossOrigin(origins = "http://localhost:4200")

public class VisitRequestController {
    private final IVisitRequestServices service;

    private final MailNotificationService notificationService;
    private final VisitRequestRepository visitRequestRepository;

    public VisitRequestController(IVisitRequestServices service, MailNotificationService notificationService, VisitRequestRepository visitRequestRepository) { this.service = service;
        this.notificationService = notificationService;
        this.visitRequestRepository = visitRequestRepository;
    }

    @PostMapping
    public ResponseEntity<VisitRequest> createRequest(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody VisitRequest request) {

        String token = authHeader.replace("Bearer ", "");
        VisitRequest created = service.create(token, request);
        return ResponseEntity.ok(created);
    }
/*
    @PostMapping("/receptionist")
    public ResponseEntity<VisitRequest> createRequestReceptionist(
            @RequestHeader("Authorization") String token,
            @RequestBody VisitRequest request) {

        String auth = token.replace("Bearer ", "");
        VisitRequest created = service.createrequestReceptionist(auth, request);
        return ResponseEntity.ok(created);
    }
*/
@PostMapping("/receptionist")
public ResponseEntity<VisitRequest> createRequestReceptionist(
        @RequestHeader("Authorization") String token,
        @RequestBody VisitRequest request,
        @RequestParam int allowedStartHour,
        @RequestParam int allowedEndHour
) {
    VisitRequest saved = service.createrequestReceptionist(token, request, allowedStartHour, allowedEndHour);
    return ResponseEntity.ok(saved);
}

    @GetMapping
    public Page<VisitRequest> getVisitRequests(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return service.findAll(pageable);
    }
    @PutMapping("/{id}")
    public VisitRequest update(@PathVariable Long id, @RequestBody VisitRequest req) {
        return service.updateVisitRequest(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{requestId}/assign/{visitorId}")
    public VisitRequest assignVisitor(@PathVariable Long requestId, @PathVariable Long visitorId) {
        return service.assignVisitor(requestId, visitorId);
    }
    @GetMapping("/by-requester/{userId}")
    public List<VisitRequest> getByRequesterId(@PathVariable Long userId) {
        return service.getRequestsByRequesterId(userId);
    }
    @GetMapping("/requests/today")
    public ResponseEntity<List<VisitRequest>> getTodayRequests() {
        LocalDateTime now = LocalDateTime.now();
        List<VisitRequest> requests = service.getRequestsByCurrentDay(now);
        return ResponseEntity.ok(requests);
    }


    @GetMapping("/{id}")
    public VisitRequest getById(@PathVariable Long id) {
        return service.findById(id);
    }


    @GetMapping("/count-by-status")
    public ResponseEntity<Map<String, Long>> countByStatus() {
        return ResponseEntity.ok(service.countByStatus());
    }


    @PostMapping("/notify")
    public ResponseEntity<String> notifyRequester(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody VisitNotificationDTO dto) {

        String token = authHeader.replace("Bearer ", "");
        try {
            notificationService.sendNotification(token, dto.getRequestId(), dto.getStatus());
            if ("WAITING".equalsIgnoreCase(dto.getStatus())) {
                notificationService.scheduleReminderEmail(token, dto.getRequestId());
            }
            return ResponseEntity.ok("Notification sent successfully.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Visit request not found");
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (MailException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/notify/action")
    public ResponseEntity<String> handleEmailAction(
            @RequestParam Long requestId,
            @RequestParam String status
    ) {
        VisitRequest request = visitRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        request.setVisitRequestStatus(VisitRequestStatus.valueOf(status.toUpperCase()));
        visitRequestRepository.save(request);

        return ResponseEntity.ok("Visitor status updated to " + status );
    }

    @GetMapping("/verify-pin")
    public ResponseEntity<Boolean> verifyPin(@RequestParam Long requestid, @RequestParam int pin) {
        boolean valid = service.verifyVisitRequestPin(requestid, pin);
        return ResponseEntity.ok(valid);
    }


    @PatchMapping("/{id}/depart")
    public ResponseEntity<Void> depart(@PathVariable Long id) {
        service.markAsDeparted(id);
        return ResponseEntity.noContent().build();
    }

    // CompanionController.java
    private static final Logger logger = LoggerFactory.getLogger(VisitRequestController.class);
    @PatchMapping("/companions/{id}/depart")
    public ResponseEntity<Companion> markGuestDeparted(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody) {

        try {
            String departureTimeStr = requestBody.get("departureTime");
            LocalDateTime departureTime;

            if (departureTimeStr != null) {
                try {
                    departureTime = LocalDateTime.parse(departureTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    logger.info("Received custom departure time: {}", departureTime);
                } catch (DateTimeParseException e) {
                    logger.error("Invalid date format for departure time: {}", departureTimeStr, e);
                    return ResponseEntity.badRequest().build();
                }
            } else {
                departureTime = LocalDateTime.now();
                logger.info("Using current time for departure: {}", departureTime);
            }

            Companion updatedGuest = service.markGuestAsDeparted(id, departureTime);
            logger.info("Guest ID {} departed at {}", id, updatedGuest.getDeparture());
            return ResponseEntity.ok(updatedGuest);

        } catch (EntityNotFoundException e) {
            logger.error("Guest not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error marking guest departure: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/active-visitors")
    public ResponseEntity<List<VisitRequest>> getVisitorsStillOnSite() {
        List<VisitRequest> activeVisitors = service.getVisitorsStillOnSite();
        return ResponseEntity.ok(activeVisitors);
    }
    @PutMapping("/admin/complete-all")
    public ResponseEntity<String> completeAllUnfinishedVisits() {
        int updatedCount = service.completeUnfinishedVisits();
        return ResponseEntity.ok("Updated " + updatedCount + " visit requests to COMPLETED.");
    }

    @GetMapping("/visits-by-status")
    public ResponseEntity<Map<String, Long>> getVisitsByStatus() {
        List<Object[]> results = visitRequestRepository.countVisitsByStatus();
        Map<String, Long> data = results.stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? ((VisitRequestStatus) row[0]).name() : "UNKNOWN", // Handle null keys
                        row -> (Long) row[1]
                ));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/visits-by-supplier")
    public ResponseEntity<Map<String, Long>> getVisitsBySupplier() {
        List<Object[]> results = visitRequestRepository.countVisitsBySupplier();
        Map<String, Long> data = results.stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "UNKNOWN", // Use company name or "UNKNOWN"
                        row -> (Long) row[1]                                 // Count of visits
                ));
        return ResponseEntity.ok(data);
    }
}
