package com.arms.platform.material;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class RankingController {
  private final MaterialRepository repo;
  public RankingController(MaterialRepository repo){ this.repo = repo; }

  @GetMapping("/rankings")
  public List<RankingRow> rankings(@RequestParam(defaultValue="50") int limit){
    int n = Math.min(Math.max(limit, 1), 100);
    return repo.topUploaders(PageRequest.of(0, n));
  }
}
