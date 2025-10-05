package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

 public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Visitor findByEmail(String email);
    Page<Visitor> findAll(Pageable pageable);

}
