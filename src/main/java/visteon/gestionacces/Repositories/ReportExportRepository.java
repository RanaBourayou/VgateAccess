package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.ReportExport;

public interface ReportExportRepository extends JpaRepository<ReportExport, Long> {
}
