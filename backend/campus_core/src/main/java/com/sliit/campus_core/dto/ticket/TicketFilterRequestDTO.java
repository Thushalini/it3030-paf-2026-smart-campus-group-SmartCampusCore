package com.sliit.campus_core.dto.ticket;

import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import lombok.Data;
 
@Data
public class TicketFilterRequestDTO {
    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;
    private String resourceId;
    private String assignedToId;
    private String reportedById;
    private String search;
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String sortDir = "DESC";

    public void setStatus(TicketStatus status) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setSearch(String search) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setCategory(TicketCategory category) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setPriority(TicketPriority priority) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setResourceId(String resourceId) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setAssignedToId(String assignedToId) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setReportedById(String reportedById) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setPage(int page) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setSize(int size) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setSortBy(String sortBy) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public void setSortDir(String sortDir) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getStatus() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getPriority() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getCategory() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getResourceId() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getAssignedToId() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getReportedById() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getSearch() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getPage() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getSize() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getSortBy() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public Object getSortDir() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}