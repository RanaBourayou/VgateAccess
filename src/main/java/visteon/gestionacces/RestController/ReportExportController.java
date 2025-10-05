package visteon.gestionacces.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.Entities.User;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.IServices.IUserServices;
import visteon.gestionacces.IServices.IVisitRequestServices;
import visteon.gestionacces.ServicesImpl.ReportExportService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports/export")
@CrossOrigin(origins = "http://localhost:4200")

 public class ReportExportController {

    @Autowired
    private IVisitRequestServices visitRequestService;

    @Autowired
    private ReportExportService reportExportService;
    @Autowired
    private IUserServices  userService;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportToCSV(@RequestParam Long userId) throws IOException {
        List<VisitRequest> data = visitRequestService.findAll();
        User user = userService.findUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        byte[] file = reportExportService.exportToCSV(data, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=visit_report.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8") // Explicit UTF-8
                .body(file);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPDF(@RequestParam Long userId) throws Exception {
        List<VisitRequest> data = visitRequestService.findAll();
        User user = userService.findUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        byte[] file = reportExportService.exportToPDF(data, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.pdf")
                .contentType(MediaType.APPLICATION_PDF) // Already correct
                .body(file);
    }

}