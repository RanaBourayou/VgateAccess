package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import visteon.gestionacces.Entities.Companion;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.Entities.VisitRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {
    List<VisitRequest> findByRequesterId(Long requesterId);
    List<VisitRequest> findByVisitDate(LocalDateTime VisitDate);

    @Query("SELECT v FROM VisitRequest v WHERE v.visitDate >= :startOfDay AND v.visitDate < :startOfNextDay")
    List<VisitRequest> findByVisitDateBetween(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay);

    @Query("SELECT v.visitRequestStatus, COUNT(v) FROM VisitRequest v GROUP BY v.visitRequestStatus")
    List<Object[]> countGroupedByStatus();
    @Query("SELECT vr FROM VisitRequest vr WHERE vr.visitRequestStatus IN :statuses AND vr.Departure IS NULL")
    List<VisitRequest> findActiveVisitorsOnSite(@Param("statuses") List<VisitRequestStatus> statuses);
   // List<VisitRequest> findByVisitRequestStatusNot(VisitRequestStatus status);
    List<VisitRequest> findByVisitRequestStatusIn(List<VisitRequestStatus> statuses);
    @Query("SELECT vr.visitRequestStatus, COUNT(vr) FROM VisitRequest vr GROUP BY vr.visitRequestStatus")
    List<Object[]> countVisitsByStatus();

    @Query("SELECT v.companyName, COUNT(vr) FROM VisitRequest vr JOIN vr.visitor v GROUP BY v.companyName")
    List<Object[]> countVisitsBySupplier();

    Page<VisitRequest> findAll(Pageable pageable);

}
