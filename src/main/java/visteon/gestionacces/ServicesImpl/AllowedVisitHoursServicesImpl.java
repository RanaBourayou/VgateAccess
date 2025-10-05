package visteon.gestionacces.ServicesImpl;

import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.AllowedVisitHours;
import visteon.gestionacces.IServices.IAllowedVisitHoursServices;
import visteon.gestionacces.Repositories.AllowedVisitHoursRepository;

import java.time.LocalDateTime;

@Service
public class AllowedVisitHoursServicesImpl implements IAllowedVisitHoursServices {
    private final AllowedVisitHoursRepository repository;

    public AllowedVisitHoursServicesImpl(AllowedVisitHoursRepository repository) {
        this.repository = repository;
    }


    public AllowedVisitHours saveVisitHours(int startHour, int endHour) {
        AllowedVisitHours hours = repository.findAll().stream().findFirst().orElse(new AllowedVisitHours());
        hours.setStartHour(startHour);
        hours.setEndHour(endHour);
        return repository.save(hours);
    }

    public AllowedVisitHours getVisitHours() {
        return repository.findAll().stream().findFirst().orElse(null);
    }

    public boolean isWithinAllowedHours(LocalDateTime time) {
        AllowedVisitHours hours = getVisitHours();
        if (hours == null) {
            throw new IllegalStateException("Allowed visit hours are not set");
        }
        int hour = time.getHour();
        return hour >= hours.getStartHour() && hour < hours.getEndHour();
    }

}
