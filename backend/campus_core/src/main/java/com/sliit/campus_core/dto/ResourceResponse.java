package com.sliit.campus_core.dto;

import com.sliit.campus_core.entity.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private String id;
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private LocalTime startTime;
    private LocalTime endTime;
    private ResourceStatus status;

    public void setStartTime(LocalTime startTime) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setEndTime(LocalTime endTime) {
        throw new UnsupportedOperationException("Not supported yet.");
    }   

    public void setStatus(ResourceStatus status) {
        throw new UnsupportedOperationException("Not supported yet.");
    }       

    public void setId(String id) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setDescription(String description) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

}
