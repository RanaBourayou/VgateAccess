package visteon.gestionacces.IServices;

import visteon.gestionacces.Entities.Companion;
import visteon.gestionacces.Entities.VisitRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IVisitRequestServices {

     VisitRequest create(String token, VisitRequest request);
    VisitRequest findById(Long id);
    List<VisitRequest> findAll();
    public VisitRequest updateVisitRequest(Long visitRequestId, VisitRequest updatedRequest) ;
    void delete(Long id);
    VisitRequest assignVisitor(Long requestId, Long visitorId);
    List<VisitRequest> getRequestsByRequesterId(Long userId);

    List<VisitRequest> getRequestsByCurrentDay(LocalDateTime today);
    Map<String, Long> countByStatus() ;
     boolean verifyVisitRequestPin(Long requestId, int pinCode) ;
     VisitRequest createrequestReceptionist(String token, VisitRequest request, int allowedStartHour, int allowedEndHour) ;
    void markAsDeparted(Long id) ;
       Companion markGuestAsDeparted(Long guestId, LocalDateTime departureTime) ;
     List<VisitRequest> getVisitorsStillOnSite();
      int completeUnfinishedVisits() ;
    public Page<VisitRequest> findAll(Pageable pageable) ;

    }
