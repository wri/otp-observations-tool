import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-law-detail',
  templateUrl: './law-detail.component.html',
  styleUrls: ['./law-detail.component.scss']
})
export class LawDetailComponent {

  loading = true;
  law: Law = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private lawsService: LawsService
  ) {
    this.lawsService.getById(this.route.snapshot.params.id, { include: 'country,subcategory' })
      .then(law => this.law = law)
      .catch(err => console.error(err))
      .then(() => this.loading = false); // TODO: visual feedback
  }

  onClickBack() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

}
