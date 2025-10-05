package visteon.gestionacces.RestController;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.Entities.AllowedVisitHours;
import visteon.gestionacces.IServices.IAllowedVisitHoursServices;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
@RequestMapping("/api/settings")
@RestController
@CrossOrigin(origins = "http://localhost:4200")

public class SettingsController {
    private final IAllowedVisitHoursServices visitHoursService;

    public SettingsController(IAllowedVisitHoursServices visitHoursService) {
        this.visitHoursService = visitHoursService;
    }

    @PostMapping("/visit-hours")
    public ResponseEntity<AllowedVisitHours> saveVisitHours(@RequestBody Map<String, Integer> payload) {
        int startHour = payload.get("startHour");
        int endHour = payload.get("endHour");
        return ResponseEntity.ok(visitHoursService.saveVisitHours(startHour, endHour));
    }

    @GetMapping("/visit-hours")
    public ResponseEntity<AllowedVisitHours> getVisitHours() {
        return ResponseEntity.ok(visitHoursService.getVisitHours());
    }

    @GetMapping("/server-time")
    public ResponseEntity<String> getServerTime() {
        String serverTime = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        return ResponseEntity.ok(serverTime);
    }
}