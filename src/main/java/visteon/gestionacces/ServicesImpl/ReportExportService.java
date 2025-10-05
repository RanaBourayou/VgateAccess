package visteon.gestionacces.ServicesImpl;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.ReportExport;
import visteon.gestionacces.Entities.User;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.IServices.IUserServices;
import visteon.gestionacces.Repositories.ReportExportRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.List;
import java.io.FileOutputStream;
import java.util.stream.Stream;
import com.itextpdf.text.Phrase;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class ReportExportService {
    private final ReportExportRepository reportExportRepository;
    private final IUserServices userService;
    @Value("${report.storage.path}")
    private String exportDirectory;


    public ReportExportService(ReportExportRepository reportExportRepository, UserService userService, IUserServices userService1) {
        this.reportExportRepository = reportExportRepository;
        this.userService = userService1;
    }

    public byte[] exportToCSV(List<VisitRequest> data, User user) throws IOException {
        File dir = new File(exportDirectory);
        if (!dir.exists()) dir.mkdirs();

        File file = new File(dir, "visit_report_" + System.currentTimeMillis() + ".csv");

        try (BufferedWriter writer = Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8)) {
            // 1. Write bom in here manually
            writer.write('\uFEFF');

            // 2. Create CSVPrinter immediately, using writer
            CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.POSTGRESQL_CSV
                    .withDelimiter(';') // use TAB
                    .withHeader("ID", "Visitor", "Date", "Time", "Status"));

            // 3. Write your data
            DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH:mm");

            for (VisitRequest req : data) {
                LocalDateTime dt = req.getVisitDate();
                csvPrinter.printRecord(
                        req.getIdVisitRequest(),
                        req.getVisitor().getFirstName(),
                        dt.format(df),
                        dt.format(tf),
                        req.getVisitRequestStatus().toString()
                );
            }
            csvPrinter.flush(); // ensure all data is written
        }

        saveReportEntry(user, file.getAbsolutePath());
        return Files.readAllBytes(file.toPath());

    }
    public byte[] exportToPDF(List<VisitRequest> data, User user) throws Exception {
        File dir = new File(exportDirectory);
        if (!dir.exists()) {
            dir.mkdirs();  // Create directory and parent directories if needed
        }

        String fileName = "visit_report_" + System.currentTimeMillis() + ".pdf";
        File file = new File(dir, fileName);  // Use dir instead of exportDirectory

        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(file));
        document.open();
        document.add(new Paragraph("Visit Requests Report"));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        Stream.of("ID", "First Name", "Last Name", "Date", "Status")
                .forEach(col -> table.addCell(new PdfPCell(new Phrase(col))));
        for (VisitRequest req : data) {
            table.addCell(String.valueOf(req.getIdVisitRequest()));
            table.addCell(req.getVisitor().getFirstName());
            table.addCell(req.getVisitor().getLastName());
            table.addCell(req.getVisitDate().toString());
            table.addCell(req.getVisitRequestStatus().toString());
        }

        document.add(table);
        document.close();

        saveReportEntry(user, file.getAbsolutePath());

        return Files.readAllBytes(file.toPath());
    }

    private void saveReportEntry(User user, String path) {
        ReportExport report = new ReportExport();
        report.setCreatedAt(LocalDateTime.now());
        report.setFilePath(path);
        report.setGeneratedBy(user);
        reportExportRepository.save(report);
    }
}

