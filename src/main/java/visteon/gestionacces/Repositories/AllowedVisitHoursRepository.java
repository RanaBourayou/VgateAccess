package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.AllowedVisitHours;

public interface AllowedVisitHoursRepository extends JpaRepository<AllowedVisitHours, Long> {
}