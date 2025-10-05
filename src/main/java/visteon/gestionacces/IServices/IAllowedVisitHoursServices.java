package visteon.gestionacces.IServices;

import visteon.gestionacces.Entities.AllowedVisitHours;

import java.time.LocalDateTime;

public interface IAllowedVisitHoursServices {
      AllowedVisitHours saveVisitHours(int startHour, int endHour);
      boolean isWithinAllowedHours(LocalDateTime time) ;
    public AllowedVisitHours getVisitHours() ;
    }
