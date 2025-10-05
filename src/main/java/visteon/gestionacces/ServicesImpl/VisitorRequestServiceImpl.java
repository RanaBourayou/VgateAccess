package visteon.gestionacces.ServicesImpl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.Companion;
import visteon.gestionacces.Entities.VisitRequest;
import visteon.gestionacces.Entities.VisitRequestStatus;
import visteon.gestionacces.Entities.Visitor;
import visteon.gestionacces.IServices.IVisitRequestServices;
import visteon.gestionacces.Repositories.UserRepository;
import visteon.gestionacces.Repositories.VisitRequestRepository;
import visteon.gestionacces.Repositories.CompanionRepository;
import visteon.gestionacces.Repositories.VisitorRepository;
import visteon.gestionacces.RestController.VisitRequestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class VisitorRequestServiceImpl implements IVisitRequestServices {
    private final VisitRequestRepository reqRepo;
    private final VisitorRepository visRepo;
    private final UserRepository userRepo;
    private final CompanionRepository visitorGuestRepo;
    private static final Logger logger = LoggerFactory.getLogger(VisitorRequestServiceImpl.class);
    private final CompanionRepository  compRepo;
    private final MailNotificationService mailNotificationService;

    public VisitorRequestServiceImpl(VisitRequestRepository reqRepo, VisitorRepository visRepo, UserRepository userRepo, CompanionRepository visitorGuestRepo, CompanionRepository compRepo, MailNotificationService mailNotificationService) {
        this.reqRepo = reqRepo;
        this.visRepo = visRepo;
        this.userRepo = userRepo;
        this.visitorGuestRepo = visitorGuestRepo;
        this.compRepo = compRepo;
        this.mailNotificationService = mailNotificationService;
    }


    /* @Override
     public VisitRequest create(String token, VisitRequest request) {
         Visitor visitor = request.getVisitor();

         if (visitor != null) {
             //  Try to find the visitor by email
             Visitor existingVisitor = visRepo.findByEmail(visitor.getEmail());

             if (existingVisitor != null) {
                 //  Use the existing visitor and their existing pin
                 request.setVisitor(existingVisitor);
             } else {
                 //  New visitor, generate and assign a PIN
                 visitor.setPinCode(generatePin());
                 visRepo.save(visitor);
                 request.setVisitor(visitor);
             }
         }

         VisitRequest saved = reqRepo.save(request);

         // Send PIN email in all cases
         mailNotificationService.sendPinCodeEmail(token, saved);

         return saved;
     }
 */
   @Override
   @Transactional
   public VisitRequest create(String token, VisitRequest request) {
       // 1. Process visitor
       Visitor visitor = request.getVisitor();
       if (visitor != null) {
           Visitor existingVisitor = visRepo.findByEmail(visitor.getEmail());
           if (existingVisitor != null) {
               request.setVisitor(existingVisitor);
           } else {
               // Save new visitor first
               visRepo.save(visitor);
               request.setVisitor(visitor);
           }
       }

       // 2. Generate and set PIN
       request.setPinCode(Integer.parseInt(generatePin()));

       // 3. Process companions BEFORE saving request
       if (request.getAdditionalGuests() != null) {
           Visitor mainVisitor = request.getVisitor();
           for (Companion guest : request.getAdditionalGuests()) {
               // Use setter to manage bidirectional relationship
               guest.setVisitor(mainVisitor);
               guest.setVisitRequest(request);
           }
       }

       // 4. Save request (will cascade to companions)
       VisitRequest savedRequest = reqRepo.save(request);

       // 5. Send email
       mailNotificationService.sendPinCodeEmail(token, savedRequest);

       return savedRequest;
   }

    @Override
    public VisitRequest findById(Long id) {
        return reqRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("VisitRequest not found"));
    }

    @Override
    public List<VisitRequest> findAll() { return reqRepo.findAll(); }

   /* @Override
    public VisitRequest update(Long id, VisitRequest request) {
        VisitRequest existing = findById(id);

         BeanUtils.copyProperties(request, existing, "idVisitRequest", "visitor");
        existing.setVisitPurpose(request.getVisitPurpose());
        existing.setVisitRequestStatus(request.getVisitRequestStatus());
        existing.setVisitDate(request.getVisitDate());
        existing.setExpectedArrival(request.getExpectedArrival());
        existing.setExpectedDeparture(request.getExpectedDeparture());
        existing.setPersonneConcernee(request.getPersonneConcernee());
        // Handle visitor relationship
        if (request.getVisitor() != null) {
            // If visitor has ID, find and attach the managed entity
            if (request.getVisitor().getIdVisitor() != null) {
                Visitor managedVisitor = visRepo.findById(request.getVisitor().getIdVisitor())
                        .orElseThrow(() -> new EntityNotFoundException("Visitor not found"));
                existing.setVisitor(managedVisitor);
            }
            // If new visitor persist it first
            else {
                Visitor newVisitor = visRepo.save(request.getVisitor());
                existing.setVisitor(newVisitor);
            }
        } else {
            // Explicitly keep existing visitor if new request has null visitor
            existing.setVisitor(existing.getVisitor());
        }

        return reqRepo.save(existing);
    }


    */

    /* @Override
    @Transactional
      public VisitRequest updateVisitRequest(Long visitRequestId, VisitRequest updatedRequest) {
         // 1. Load existing request
         VisitRequest existingRequest = reqRepo.findById(visitRequestId)
                 .orElseThrow(() -> new EntityNotFoundException("VisitRequest not found"));

         // 2. Copy properties (exclude collections and version)
         BeanUtils.copyProperties(updatedRequest, existingRequest,
                 "idVisitRequest", "additionalGuests", "visitor", "version");

         // 3. Handle version
         existingRequest.setVersion(updatedRequest.getVersion());

         // 4. Prepare incoming guests
         List<Companion> incomingGuests = updatedRequest.getAdditionalGuests() != null
                 ? updatedRequest.getAdditionalGuests()
                 : Collections.emptyList();

         // 5. Update visitor (without touching guestList)
         if (updatedRequest.getVisitor() != null) {
             if (updatedRequest.getVisitor().getIdVisitor() != null) {
                 Visitor existingVisitor = visRepo.findById(updatedRequest.getVisitor().getIdVisitor())
                         .orElseThrow(() -> new EntityNotFoundException("Visitor not found"));
                 BeanUtils.copyProperties(updatedRequest.getVisitor(), existingVisitor,
                         "idVisitor", "visitRequests", "guestList");
                 existingRequest.setVisitor(existingVisitor);
             } else {
                 existingRequest.setVisitor(updatedRequest.getVisitor());
             }
         }

         // 6. Synchronize companions - CRITICAL FIX
         // Step 1: Remove companions not in incoming list
         List<Companion> companionsToRemove = new ArrayList<>();
         for (Companion existingCompanion : existingRequest.getAdditionalGuests()) {
             boolean found = incomingGuests.stream()
                     .anyMatch(g -> g.getIdCompanion() != null &&
                             g.getIdCompanion().equals(existingCompanion.getIdCompanion()));
             if (!found) {
                 companionsToRemove.add(existingCompanion);
             }
         }
         companionsToRemove.forEach(comp -> {
             existingRequest.getAdditionalGuests().remove(comp);
             comp.setVisitRequest(null);
         });

         // Step 2: Add/update companions
         for (Companion guest : incomingGuests) {
             if (guest.getIdCompanion() != null) {
                 // Update existing companion
                 Companion existingCompanion = existingRequest.getAdditionalGuests().stream()
                         .filter(g -> g.getIdCompanion().equals(guest.getIdCompanion()))
                         .findFirst()
                         .orElseThrow(() -> new EntityNotFoundException("Companion not found"));

                 BeanUtils.copyProperties(guest, existingCompanion,
                         "idCompanion", "visitRequest", "visitor");

                 existingCompanion.setVisitor(existingRequest.getVisitor());
             } else {
                 // Add new companion
                 guest.setVisitRequest(existingRequest);
                 guest.setVisitor(existingRequest.getVisitor());
                 existingRequest.getAdditionalGuests().add(guest);
             }
         }

         return reqRepo.save(existingRequest);
     }*/

    @Override
    @Transactional
    public VisitRequest updateVisitRequest(Long visitRequestId, VisitRequest updatedRequest) {
        // 1. Load existing request
        VisitRequest existingRequest = reqRepo.findById(visitRequestId)
                .orElseThrow(() -> new EntityNotFoundException("VisitRequest not found"));

        // 2. Copy properties (exclude collections and version)
        BeanUtils.copyProperties(updatedRequest, existingRequest,
                "idVisitRequest", "additionalGuests", "visitor", "version");

        // 3. Handle version
        existingRequest.setVersion(updatedRequest.getVersion());

        // 4. Prepare incoming guests
        List<Companion> incomingGuests = updatedRequest.getAdditionalGuests() != null
                ? updatedRequest.getAdditionalGuests()
                : Collections.emptyList();

        // 5. Process visitor
        Visitor updatedVisitor = updatedRequest.getVisitor();
        if (updatedVisitor != null) {
            Visitor existingVisitor = visRepo.findByEmail(updatedVisitor.getEmail());

            if (existingVisitor != null) {
                BeanUtils.copyProperties(updatedVisitor, existingVisitor,
                        "idVisitor", "visitRequests", "guestList");
                existingRequest.setVisitor(existingVisitor);
            } else {
                visRepo.save(updatedVisitor);
                existingRequest.setVisitor(updatedVisitor);
            }
        }

        // 6. Get reference to visitor
        Visitor mainVisitor = existingRequest.getVisitor();

        // 7. Synchronize companions
        // Step 1: Remove companions not in incoming list
        List<Companion> companionsToRemove = new ArrayList<>();
        for (Companion existingCompanion : new ArrayList<>(existingRequest.getAdditionalGuests())) {
            boolean found = incomingGuests.stream()
                    .anyMatch(g -> g.getIdCompanion() != null &&
                            g.getIdCompanion().equals(existingCompanion.getIdCompanion()));
            if (!found) {
                companionsToRemove.add(existingCompanion);
            }
        }

        companionsToRemove.forEach(comp -> {
            existingRequest.getAdditionalGuests().remove(comp);
            comp.setVisitRequest(null);
            if (comp.getVisitor() != null) {
                comp.getVisitor().getGuestList().remove(comp);
            }
        });

        // Step 2: Add/update companions
        for (Companion guest : incomingGuests) {
            if (guest.getIdCompanion() != null) {
                // Update existing companion
                Companion existingCompanion = existingRequest.getAdditionalGuests().stream()
                        .filter(g -> g.getIdCompanion().equals(guest.getIdCompanion()))
                        .findFirst()
                        .orElseThrow(() -> new EntityNotFoundException("Companion not found"));

                // Update fields safely
                existingCompanion.setFirstName(guest.getFirstName());
                existingCompanion.setLastName(guest.getLastName());
                existingCompanion.setEmail(guest.getEmail());
                existingCompanion.setPhoneNumber(guest.getPhoneNumber());
                existingCompanion.setCompanyName(guest.getCompanyName());

                // Handle times - prevent nulls
                if (guest.getArrival() != null) {
                    existingCompanion.setArrival(guest.getArrival());
                }
                if (guest.getDeparture() != null) {
                    existingCompanion.setDeparture(guest.getDeparture());
                }

                // Maintain relationships
                existingCompanion.setVisitor(mainVisitor);
                if (mainVisitor != null && !mainVisitor.getGuestList().contains(existingCompanion)) {
                    mainVisitor.getGuestList().add(existingCompanion);
                }
            } else {
                // New companion - set defaults for required fields
                if (guest.getArrival() == null) {
                    guest.setArrival(existingRequest.getExpectedArrival());
                }
                if (guest.getDeparture() == null) {
                    guest.setDeparture(existingRequest.getExpectedDeparture());
                }

                // Set relationships
                guest.setVisitRequest(existingRequest);
                guest.setVisitor(mainVisitor);

                // Add to collections
                existingRequest.getAdditionalGuests().add(guest);
                if (mainVisitor != null && !mainVisitor.getGuestList().contains(guest)) {
                    mainVisitor.getGuestList().add(guest);
                }
            }
        }

        return reqRepo.save(existingRequest);
    }
    @Override
    public void delete(Long id) { reqRepo.deleteById(id); }

    @Override
    public VisitRequest assignVisitor(Long requestId, Long visitorId) {
        VisitRequest vr = findById(requestId);
        Visitor v = visRepo.findById(visitorId)
                .orElseThrow(() -> new EntityNotFoundException("Visitor not found"));
        vr.setVisitor(v);
        return reqRepo.save(vr);
    }
    @Override
    public List<VisitRequest> getRequestsByRequesterId(Long userId) {
        return reqRepo.findByRequesterId(userId);
    }

    @Override
    public List<VisitRequest> getRequestsByCurrentDay(LocalDateTime ignored) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfNextDay = today.plusDays(1).atStartOfDay();

        return reqRepo.findByVisitDateBetween(startOfDay, startOfNextDay);
    }

    @Override
    public Map<String, Long> countByStatus() {
        List<Object[]> results = reqRepo.countGroupedByStatus();

        Map<String, Long> statusCounts = new HashMap<>();
        for (Object[] row : results) {
            VisitRequestStatus status = (VisitRequestStatus) row[0]; // ✅ correct cast
            Long count = (Long) row[1];
            statusCounts.put(status.toString(), count); // ✅ convert to string
        }
        return statusCounts;
    }
    private String generatePin() {
        String pinCode = String.format("%04d", (int)(Math.random() * 100));
        logger .info("Generated PIN code: {}", pinCode);
        return pinCode;

    }

    public boolean verifyVisitRequestPin(Long requestId, int pinCode) {
        VisitRequest request = reqRepo.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("VisitRequest not found"));

        return request.getPinCode() == pinCode;
    }

    @Transactional
    public VisitRequest createrequestReceptionist(String token, VisitRequest request, int allowedStartHour, int allowedEndHour) {
        Visitor visitor = request.getVisitor();
        if (visitor == null) {
            throw new IllegalArgumentException("Visitor is required");
        }

        Visitor persistedVisitor;
        Visitor existing = visRepo.findByEmail(visitor.getEmail());
        if (existing != null) {
            request.setVisitor(existing);
            persistedVisitor = existing;
        } else {
            persistedVisitor = visRepo.save(visitor);
            request.setVisitor(persistedVisitor);
        }

        // ✅ Dynamically validate time window
        LocalDateTime arrival = request.getExpectedArrival();
        int hour = arrival.getHour();
        if (!(hour >= allowedStartHour || hour < allowedEndHour)) {
            throw new IllegalArgumentException("Visit time must be between " + allowedStartHour + ":00 and " + allowedEndHour + ":00.");
        }

        if (request.getAdditionalGuests() != null) {
            for (Companion guest : request.getAdditionalGuests()) {
                guest.setVisitor(persistedVisitor);
                guest.setVisitRequest(request);
            }
        }

        return reqRepo.save(request);
    }


    private void processGuests(List<Companion> guests, Visitor visitor, VisitRequest request) {
        for (Companion guest : guests) {
            guest.setVisitor(visitor);
            guest.setVisitRequest(request);
        }
    }

    @Transactional
    @Override
    public void markAsDeparted(Long id) {
        VisitRequest req = reqRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("VisitRequest not found"));

        LocalDateTime now = LocalDateTime.now();

        // Update main visitor status and departure time
        req.setVisitRequestStatus(VisitRequestStatus.COMPLETED);
        req.setDeparture(now);

        // Update each companion’s departure time
        if (req.getAdditionalGuests() != null) {
            for (Companion companion : req.getAdditionalGuests()) {
                companion.setDeparture(now);
            }
        }
        System.out.println("Marking visitRequest ID " + id + " as COMPLETED at " + now);
        req.getAdditionalGuests().forEach(g ->
                System.out.println(" - Guest: " + g.getFirstName() + " " + g.getLastName() + " → departure: " + now)
        );

        reqRepo.save(req);
    }

    // VisitRequestServiceImpl.java
    @Transactional
    @Override
    public Companion markGuestAsDeparted(Long guestId, LocalDateTime departureTime) {
        logger.info("Marking guest as departed: {}", guestId);
        Companion guest = compRepo.findById(guestId)
                .orElseThrow(() -> {
                    logger.error("Guest not found: {}", guestId);
                    return new EntityNotFoundException("Guest not found");
                });

        // Only validate if arrival exists
        if (guest.getArrival() != null) {
            // Allow departure before scheduled time but not before actual arrival
            if (departureTime.isBefore(guest.getArrival())) {
                logger.warn("Departure time {} is before arrival time {} for guest {}",
                        departureTime, guest.getArrival(), guestId);
                throw new IllegalArgumentException("Departure time cannot be before arrival time");
            }
        }

        guest.setDeparture(departureTime);
        Companion savedGuest = compRepo.save(guest);

        logger.info("Guest {} {} departed at {}",
                savedGuest.getFirstName(),
                savedGuest.getLastName(),
                savedGuest.getDeparture());

        return savedGuest;
    }


    @Override
    public List<VisitRequest> getVisitorsStillOnSite() {
        // Visitors who arrived but not yet completed
        List<VisitRequest> activeRequests = reqRepo.findActiveVisitorsOnSite(
                Arrays.asList(VisitRequestStatus.ARRIVED, VisitRequestStatus.WAITING)
        );

        return activeRequests;
    }
    @Transactional
    @Override
    public int completeUnfinishedVisits() {
        List<VisitRequest> requests = reqRepo.findByVisitRequestStatusIn(
                List.of(
                        VisitRequestStatus.PENDING,
                        VisitRequestStatus.APPROVED,
                        VisitRequestStatus.ARRIVED
                )
        );

        for (VisitRequest request : requests) {
            request.setVisitRequestStatus(VisitRequestStatus.COMPLETED);
        }

        reqRepo.saveAll(requests);
        return requests.size();
    }
  /*  @Transactional
    public VisitRequest createrequestReceptionist(String token, VisitRequest request) {
        // Check admin approval
        if (!request.isAdmin_approval()) {
            logger.warn("Attempt to create a visit request without admin approval. Requester token: {}", token);
            throw new IllegalArgumentException("Admin approval is required to create a new visit request.");
        }

        // 1. Process visitor
        Visitor visitor = request.getVisitor();
        if (visitor == null) {
            throw new IllegalArgumentException("Visitor is required");
        }

        Visitor persistedVisitor;
        Visitor existing = visRepo.findByEmail(visitor.getEmail());
        if (existing != null) {
            request.setVisitor(existing);
            persistedVisitor = existing;
        } else {
            persistedVisitor = visRepo.save(visitor);
            request.setVisitor(persistedVisitor);
        }

        // 2. Process companions
        if (request.getAdditionalGuests() != null) {
            for (Companion guest : request.getAdditionalGuests()) {
                guest.setVisitor(persistedVisitor);
                guest.setVisitRequest(request);
            }
        }

        // 3. Save
        return reqRepo.save(request);
    }
*/
  @Override
  public Page<VisitRequest> findAll(Pageable pageable) {
      return reqRepo.findAll(pageable);
  }
}
