package visteon.gestionacces.ServicesImpl;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.Entities.Companion;
import visteon.gestionacces.IServices.IVisitorGuestServices;
import visteon.gestionacces.Repositories.VisitRequestRepository;
import visteon.gestionacces.Repositories.CompanionRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VisitorGuestServiceImpl implements IVisitorGuestServices{
    private final CompanionRepository repo;
    private final VisitRequestRepository visitRequestRepository;

    public VisitorGuestServiceImpl(CompanionRepository repo, VisitRequestRepository visitRequestRepository) {
        this.repo = repo;
        this.visitRequestRepository = visitRequestRepository;
    }
    @Override
    public List<Companion> findAll() {
        return repo.findAll();
    }

    @Override
    public List<Companion> findByVisitRequest(Long idRequest) {
        return repo.findByVisitRequest_IdVisitRequest(idRequest);
    }

     @Override
    public List<Companion> saveAll(List<Companion> guests) {
        // Save individually to avoid batch issues
        return guests.stream()
                .map(repo::save)
                .collect(Collectors.toList());
    }

    @Override
    public Companion save(Companion guest) {
        return repo.save(guest);
    }

    @Override
    public void deleteByVisitRequest(Long idRequest) {
        repo.deleteById(idRequest);
    }

    @Override
    public void deleteById(Long idGuest) {
        repo.deleteById(idGuest);
    }

    @Override
    public Companion update(Long idGuest, Companion updatedGuest, long idVisitRequest) {
        Companion existingGuest = repo.findById(idGuest)
                .orElseThrow(() -> new EntityNotFoundException("VisitorGuest not found with ID: " + idGuest));

        VisitRequest visitRequest = visitRequestRepository.findById(idVisitRequest)
                .orElseThrow(() -> new EntityNotFoundException("VisitRequest not found with ID: " + idVisitRequest));

        existingGuest.setFirstName(updatedGuest.getFirstName());
        existingGuest.setLastName(updatedGuest.getLastName());
        existingGuest.setEmail(updatedGuest.getEmail());
        existingGuest.setPhoneNumber(updatedGuest.getPhoneNumber());
        existingGuest.setArrival(updatedGuest.getArrival());
        existingGuest.setDeparture(updatedGuest.getDeparture());
        existingGuest.setVisitRequest(visitRequest);

        return repo.save(existingGuest);
    }

}
