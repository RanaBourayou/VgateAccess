package visteon.gestionacces.ServicesImpl;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.Visitor;
import visteon.gestionacces.IServices.IVisitorServices;
import visteon.gestionacces.Repositories.VisitorRepository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class VisitorServiceImpl implements IVisitorServices {
    private final VisitorRepository repo;
    public VisitorServiceImpl(VisitorRepository repo) { this.repo = repo; }

    @Override
    public Visitor create(Visitor visitor) { return repo.save(visitor); }

    @Override
    public Visitor findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Visitor not found"));
    }

    @Override
    public List<Visitor> findAll() { return repo.findAll(); }

    @Override
    public Visitor update(Long id, Visitor visitor) {
        Visitor existing = findById(id);

        if (visitor.getFirstName() != null) {
            existing.setFirstName(visitor.getFirstName());
        }

        if (visitor.getLastName() != null) {
            existing.setLastName(visitor.getLastName());
        }

        if (visitor.getEmail() != null) {
            existing.setEmail(visitor.getEmail());
        }

        if (visitor.getPhoneNumber() != 0) { // Because it's a primitive int (not Integer)
            existing.setPhoneNumber(visitor.getPhoneNumber());
        }

        if (visitor.getCompanyName() != null) {
            existing.setCompanyName(visitor.getCompanyName());
        }

        if (visitor.getCin() != null) {
            existing.setCin(visitor.getCin());
        }

        if (visitor.getVisitorType() != null) {
            existing.setVisitorType(visitor.getVisitorType());
        }


        return repo.save(existing);
    }


    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public Visitor findByEmail(String email) {
        return repo.findByEmail(email);
    }


    @Override
    public Page<Visitor> findAll(Pageable pageable) {
        return repo.findAll(pageable);
    }}
