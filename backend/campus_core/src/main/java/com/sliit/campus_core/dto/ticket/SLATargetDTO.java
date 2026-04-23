package com.sliit.campus_core.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SLATargetDTO {
    private int firstResponseTargetMinutes;
    private int resolutionTargetMinutes;    
}
