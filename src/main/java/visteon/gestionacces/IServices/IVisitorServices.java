package visteon.gestionacces.IServices;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import visteon.gestionacces.Entities.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IVisitorServices {
    Visitor create(Visitor visitor);
    Visitor findById(Long id);
    List<Visitor> findAll();
    Visitor update(Long id, Visitor visitor);
    void delete(Long id);
    Visitor findByEmail(String email);
    Page<Visitor> findAll(Pageable pageable) ;

    }
