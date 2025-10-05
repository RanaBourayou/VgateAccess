package visteon.gestionacces.RestController;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.Entities.Companion;
import visteon.gestionacces.IServices.IVisitorGuestServices;

import java.util.List;
@RestController
@RequestMapping("/api/visitors/guests")
public class VisitorGuestController {
    private final IVisitorGuestServices service;

    public VisitorGuestController(IVisitorGuestServices service) {
        this.service = service;
    }

     @PostMapping
    public ResponseEntity<List<Companion>> createGuests(@RequestBody List<Companion> guests) {
        return ResponseEntity.ok(service.saveAll(guests));
    }

    @GetMapping
    public List<Companion> getVisitorGuest() {
        return service.findAll();
    }
}