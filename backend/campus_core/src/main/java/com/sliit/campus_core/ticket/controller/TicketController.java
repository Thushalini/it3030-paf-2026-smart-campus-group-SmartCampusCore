package com.sliit.campus_core.ticket.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TicketController {
 
    @GetMapping("/")
    public String rootEndpoint() {
        return "Hello world!";
    }

    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "Guest") String name) {
        return "Hello " + name;
    }


}
