import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { errorMessage } from '../../../core/utils/http-error';
import { ProfileService } from '../profile.service';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  farmSize: number;
  crops: string[];
  joinDate?: string;
  accountStatus: string;
  isProfileCompleted: boolean;
  totalPredictions: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  phone: string = '';
  location: string = '';
  farmSize: number | null = null;
  selectedCrops: string[] = [];

  saving: boolean = false;
  loading: boolean = false;
  error: string = '';

  viewMode: 'form' | 'view' = 'form';
  userProfile: UserProfile | null = null;

  cropOptions: string[] = [
    'Wheat',
    'Barley',
    'Yellow_Maize',
    'White Maize',
    'Lentils',
    'Chickpeas',
    'Alfalfa',
    'Common Vetch',
    'Oriental Tobacco',
    'Red Tobacco',
    'Garlic',
    'Vicia',
    'Sesame',
    'Lemon',
    'Olive',
    'Grapes',
    'Apple',
    'Banana',
    'Grapefruit',
    'Clementine',
    'Mandarin',
    'Navel Orange',
    'Pomelo',
    'Pomegranate',
    'Peach',
    'Apricot',
    'Palm Trees',
    'Mediterranean Mandarin',
    'Opium Poppy',
    'Fig',
    'Almond',
    'Nectarine',
    'Pear',
    'Guava',
    'Tomato',
    'Cucumber',
    'Potato',
    'Melon',
    'Watermelon',
    'Zucchini',
    'Eggplant',
    'Green Onion',
    'Onion',
    'Molokhia',
    'Beans',
    'Cauliflower',
    'Cabbage',
    'Chili Pepper',
    'Sweet Pepper',
    'Green Fava Beans',
    'Peas',
    'Cowpea',
    'Okra',
    'Lettuce',
    'Spinach',
    'Armenian Cucumber',
    'Turnip',
    'Carrot',
    'Parsley',
    'Radish'
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private session: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // The authGuard already made sure we are logged in, so the session has the user id.
    const userId = this.session.userId();
    if (userId === null) return;

    this.loadProfileIfExists(userId);
  }

  loadProfileIfExists(userId: number): void {
    this.loading = true;
    this.error = '';

    this.profileService.get(userId).subscribe({
      next: (res) => {

        this.applyProfileResponse(res, userId);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // No profile yet (or it could not be loaded): show the form so the user can fill it.
        this.loading = false;
        this.viewMode = 'form';
        this.cdr.detectChanges();
      }
    });
  }

  private applyProfileResponse(res: any, userId: number): void {
    const cropsArray = this.normalizeCrops(res?.crops);

    const phone = res?.phone || '';
    const location = res?.location || '';
    const farmSizeNumber = Number(res?.farmSize || 0);

    const isComplete =
      phone.trim() !== '' &&
      location.trim() !== '' &&
      farmSizeNumber > 0 &&
      cropsArray.length > 0;

    this.phone = phone;
    this.location = location;
    this.farmSize = farmSizeNumber > 0 ? farmSizeNumber : null;
    this.selectedCrops = [...cropsArray];

    this.userProfile = {
      id: res?.id || userId,
      firstName: res?.firstName || this.session.user()?.firstName || '',
      lastName: res?.lastName || this.session.user()?.lastName || '',
      email: res?.email || this.session.user()?.email || '',
      phone: phone,
      location: location,
      farmSize: farmSizeNumber,
      crops: cropsArray,
      joinDate: res?.joinDate,
      accountStatus: res?.accountStatus || 'Active',
      isProfileCompleted: isComplete,
      totalPredictions: res?.totalPredictions || 0
    };

    this.session.setProfileCompleted(isComplete);

    this.viewMode = isComplete ? 'view' : 'form';
  }

  normalizeCrops(crops: any): string[] {
    if (Array.isArray(crops)) {
      return crops
        .map((c: any) => String(c).trim())
        .filter((c: string) => c !== '');
    }

    if (typeof crops === 'string' && crops.trim() !== '') {
      return crops
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c !== '');
    }

    return [];
  }

  toggleCrop(crop: string): void {
    if (this.selectedCrops.includes(crop)) {
      this.selectedCrops = this.selectedCrops.filter(c => c !== crop);
    } else {
      this.selectedCrops.push(crop);
    }
  }

  isCropSelected(crop: string): boolean {
    return this.selectedCrops.includes(crop);
  }

  saveProfile(): void {
    if (this.saving) {
      return;
    }

    this.error = '';

    const userId = this.session.userId();
    if (userId === null) return;

    if (
      this.phone.trim() === '' ||
      this.location.trim() === '' ||
      this.farmSize === null ||
      Number(this.farmSize) <= 0 ||
      this.selectedCrops.length === 0
    ) {
      this.error = 'Please fill all fields and select at least one crop.';
      return;
    }

    const profileData = {
      phone: this.phone.trim(),
      location: this.location.trim(),
      farmSize: Number(this.farmSize),
      crops: [...this.selectedCrops]
    };

    this.saving = true;

    // PUT returns the saved profile, so we can show it directly (no second GET needed).
    this.profileService.update(userId, profileData).subscribe({
      next: (res) => {
        this.applyProfileResponse(res.user, userId);
        this.saving = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.saving = false;
        this.error = errorMessage(err, 'Unable to save profile.');
        this.cdr.detectChanges();
      }
    });
  }

  editProfile(): void {
    if (this.userProfile) {
      this.phone = this.userProfile.phone || '';
      this.location = this.userProfile.location || '';
      this.farmSize =
        this.userProfile.farmSize && this.userProfile.farmSize > 0
          ? this.userProfile.farmSize
          : null;

      this.selectedCrops = [...(this.userProfile.crops || [])];
    }

    this.error = '';
    this.saving = false;
    this.viewMode = 'form';
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
  }

getCropIcon(crop: string): string {
  const normalizedCrop = crop.trim();

  const cropIcons: { [key: string]: string } = {
    'Wheat': '🌾',
    'Barley': '🌱',
    'Yellow_Maize': '🌽',
    'White Maize': '🍿',

    'Lentils': '🫘',
    'Chickpeas': '🧆',
    'Alfalfa': '☘️',
    'Common Vetch': '🌿',
    'Oriental Tobacco': '🍃',
    'Red Tobacco': '🍂',
    'Garlic': '🧄',
    'Vicia': '🍀',
    'Sesame': '🌰',

    'Lemon': '🍋',
    'Olive': '🫒',
    'Grapes': '🍇',
    'Apple': '🍎',
    'Banana': '🍌',
    'Grapefruit': '🍊',
    'Clementine': '🍊',
    'Mandarin': '🍊',
    'Navel Orange': '🍊',
    'Pomelo': '🍈',
    'Pomegranate': '🍎',
    'Peach': '🍑',
    'Apricot': '🍑',
    'Palm Trees': '🌴',
    'palm trees': '🌴',
    'Mediterranean Mandarin': '🍊',
    'Opium Poppy': '🌺',
    'Fig': '🫐',
    'Almond': '🌰',
    'Nectarine': '🍑',
    'Pear': '🍐',
    'Guava': '🍈',

    'Tomato': '🍅',
    'Cucumber': '🥒',
    'Potato': '🥔',
    'Melon': '🍈',
    'Watermelon': '🍉',
    'Zucchini': '🥒',
    'zucchini': '🥒',
    'Eggplant': '🍆',
    'Green Onion': '🧅',
    'Onion': '🧅',
    'Molokhia': '🌿',
    'Beans': '🫘',
    'Cauliflower': '🥦',
    'Cabbage': '🥬',
    'Chili Pepper': '🌶️',
    'Sweet Pepper': '🫑',
    'Green Fava Beans': '🫘',
    'Peas': '🟢',
    'Cowpea': '🫘',
    'Okra': '🌿',
    'Lettuce': '🥬',
    'Spinach': '🥬',
    'Armenian Cucumber': '🥒',
    'Turnip': '🥕',
    'Carrot': '🥕',
    'Parsley': '🌿',
    'Radish': '🌱'
  };

  return cropIcons[normalizedCrop] || '🌱';
}


  

}