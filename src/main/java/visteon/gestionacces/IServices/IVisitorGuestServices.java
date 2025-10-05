package visteon.gestionacces.IServices;

import visteon.gestionacces.Entities.Companion;

import java.util.List;

public interface IVisitorGuestServices {

    List<Companion> findAll();
    List<Companion> findByVisitRequest(Long idRequest);
    List<Companion> saveAll(List<Companion> guests) ;
    Companion save(Companion guest);

    void deleteByVisitRequest(Long idRequest);

    void deleteById(Long idGuest);
    Companion update(Long idguest, Companion guest, long idVisitRequest);

    }
