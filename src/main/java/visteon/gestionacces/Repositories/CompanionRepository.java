package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.Companion;

import java.util.List;

public interface CompanionRepository extends JpaRepository<Companion, Long> {
    List<Companion> findByVisitRequest_IdVisitRequest(Long visitRequestId);
    void deleteByVisitRequest_IdVisitRequest(Long visitRequestId);

}
